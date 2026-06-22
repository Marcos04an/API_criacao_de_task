# API de Usuários e Tarefas

API REST simples para cadastro de usuários, cadastro de tarefas e associação de várias tarefas a um usuário. O projeto usa PostgreSQL como banco transacional e MongoDB como armazenamento dos logs de erro.

## Objetivo

O domínio possui duas entidades principais:

- *Usuário*: pessoa responsável pelas tarefas.
- *Tarefa*: atividade pertencente obrigatoriamente a um usuário.

O relacionamento é *um para muitos (1:N)*: um usuário pode possuir nenhuma ou várias tarefas, enquanto cada tarefa pertence a exatamente um usuário.

## Tecnologias

- Node.js e TypeScript
- Express 5
- Prisma ORM
- PostgreSQL 16
- Driver oficial do MongoDB
- Swagger UI / OpenAPI 3
- Docker Compose

## Visão da arquitetura

text
Cliente HTTP
    |
    v
Express (rotas)
    |
    v
Controllers -> Services -> Prisma Client -> PostgreSQL
    |              |
    |              +-- regras de negócio e validações
    |
    +-- erro -> errorHandler -> errorLogService -> MongoDB
                         |
                         +-- resposta HTTP padronizada


### Responsabilidades por camada

| Camada | Local | Responsabilidade |
|---|---|---|
| Inicialização | server.ts | Configura JSON, CORS, Swagger, rotas e middleware de erro; inicia na porta 3000. |
| Rotas | src/routes | Mapeia os endpoints HTTP para os controllers. |
| Controllers | src/controllers | Extrai dados da requisição, chama os services e define o status da resposta. |
| Services | src/services | Executa validações, regras de negócio e operações de persistência. |
| Configuração | src/config | Expõe os clientes do Prisma e MongoDB e a especificação Swagger. |
| Erros | src/errors e src/middlewares | Representa erros esperados, registra falhas e produz a resposta HTTP. |
| Modelo relacional | prisma | Define o schema Prisma e o histórico de migrations do PostgreSQL. |

## Bancos de dados

### Como o PostgreSQL é conectado à API?

A URL de conexão é fornecida pela variável POSTGRES_DATABASE_URL. O datasource do Prisma declara o provider postgresql em prisma/schema.prisma, e src/config/prisma.ts cria uma instância única de PrismaClient:

ts
const prisma = new PrismaClient()


Os services importam essa instância e usam métodos como prisma.user.create, prisma.task.findMany e prisma.task.update. O Prisma abre e administra o pool de conexões quando a primeira consulta é executada; o código atual não testa a conexão durante a inicialização do servidor.

O arquivo prisma.config.ts também lê POSTGRES_DATABASE_URL para os comandos de migration. Em ambiente local, o Docker publica o PostgreSQL em localhost:5432, com banco backend_db, usuário admin e senha admin.

Fluxo resumido:

text
Requisição -> Controller -> Service -> PrismaClient
                                      |
POSTGRES_DATABASE_URL ----------------+
                                      |
                                      v
                                  PostgreSQL


As migrations criam as tabelas, índices únicos e a chave estrangeira. Elas devem ser aplicadas antes do uso da API.

### Como o MongoDB é conectado aos logs de erro?

O MongoDB não armazena usuários nem tarefas. Ele é usado exclusivamente para observabilidade de erros.

src/config/mongo.ts implementa uma conexão *lazy* (sob demanda):

1. Na primeira falha processada, getMongoDb() lê MONGO_LOGS_URL.
2. Se a variável não existir, usa mongodb://localhost:27018/error_logs.
3. Um único MongoClient e uma única Promise de conexão são mantidos em memória e reutilizados.
4. O banco retornado é o indicado no caminho da URL, por padrão error_logs.

Todo erro encaminhado por um controller com next(error) chega ao middleware global errorHandler, registrado depois das rotas. Antes de responder ao cliente, o middleware chama errorLogService.create(error, req), que insere um documento na collection error_logs com:

json
{
  "name": "AppError",
  "message": "Usuário relacionado não encontrado",
  "statusCode": 404,
  "method": "POST",
  "route": "/tasks",
  "body": {},
  "params": {},
  "query": {},
  "stack": "...",
  "createdAt": "2026-06-21T00:00:00.000Z"
}


Erros esperados são instâncias de AppError e preservam o status definido (por exemplo, 400, 404 ou 409). Erros inesperados recebem status 500 e a mensagem pública Erro interno do servidor.

Se o MongoDB estiver indisponível, a falha do registro é capturada e enviada ao console.error; a API ainda devolve ao cliente a resposta do erro original. Assim, a indisponibilidade do banco de logs não substitui o erro de negócio.

> Atenção: o log atual grava integralmente body, params, query e stack. Em produção, dados sensíveis devem ser mascarados, uma política de retenção deve ser definida e a collection deve ter controle de acesso.

## Relacionamento entre usuário e tarefa

O relacionamento 1:N é definido no Prisma desta forma:

prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
  age   String
  tasks Task[]
}

model Task {
  id          String  @id @default(uuid())
  title       String  @unique
  description String?
  completed   Boolean @default(false)
  userId      String
  user        User    @relation(fields: [userId], references: [id], onDelete: Restrict)
}


Task.userId é obrigatório e funciona como chave estrangeira para User.id. A migration cria a constraint Task_userId_fkey com ON DELETE RESTRICT e ON UPDATE CASCADE.

O relacionamento é garantido em dois níveis:

1. *Aplicação*: ao criar uma tarefa, taskService exige userId e consulta o usuário. Se ele não existir, retorna 404. Ao trocar o responsável de uma tarefa, o novo usuário também é validado.
2. *Banco de dados*: a chave estrangeira impede tarefas órfãs, mesmo se a validação da aplicação for contornada.

A listagem de tarefas usa include: { user: true }, portanto cada tarefa é retornada junto com os dados do seu usuário. A exclusão de usuário é bloqueada quando existem tarefas vinculadas, tanto pela regra no userService quanto pelo ON DELETE RESTRICT do PostgreSQL.

## Modelo de dados

### User

| Campo | Tipo | Regra |
|---|---|---|
| id | string/UUID | Chave primária, gerada automaticamente. |
| email | string | Obrigatório e único. |
| name | string | Obrigatório. |
| age | string | Obrigatório; atualmente não é um número. |
| tasks | relação | Lista virtual de tarefas do usuário no Prisma. |

### Task

| Campo | Tipo | Regra |
|---|---|---|
| id | string/UUID | Chave primária, gerada automaticamente. |
| title | string | Obrigatório e único globalmente. |
| description | string ou null | Opcional. |
| completed | boolean | Padrão false. |
| userId | string/UUID | Obrigatório; chave estrangeira para User.id. |

## Configuração e execução local

### Pré-requisitos

- Node.js compatível com ES2022
- npm
- Docker e Docker Compose

### 1. Instalar dependências

bash
npm install


### 2. Iniciar PostgreSQL e MongoDB

bash
docker compose up -d


O Compose publica:

- PostgreSQL: localhost:5432
- MongoDB: localhost:27018 (porta interna do container: 27017)

### 3. Criar o arquivo .env

env
POSTGRES_DATABASE_URL="postgresql://admin:admin@localhost:5432/backend_db?schema=public"
MONGO_LOGS_URL="mongodb://localhost:27018/error_logs"


O .env está ignorado pelo Git. As credenciais do Compose servem apenas para desenvolvimento local e devem ser substituídas em outros ambientes.

### 4. Aplicar as migrations

bash
npx prisma migrate deploy


Para desenvolvimento, quando for necessário criar uma nova migration:

bash
npx prisma migrate dev


### 5. Executar a API

bash
npm run dev


A API fica disponível em http://localhost:3000. A documentação Swagger interativa fica em http://localhost:3000/api-docs.

Para produção:

bash
npm run build
npm start


## Respostas de erro

O formato público é:

json
{
  "error": "Mensagem do erro"
}


Principais status usados:

| Status | Significado no projeto |
|---|---|
| 400 | Dados obrigatórios ausentes ou inválidos. |
| 401 | Header x-user-id ausente em alteração/exclusão de usuário. |
| 403 | O ID informado no header difere do ID da URL. |
| 404 | Usuário ou tarefa não encontrado. |
| 409 | E-mail/título duplicado ou usuário com tarefas vinculadas. |
| 500 | Falha inesperada. |

## Regras de negócio implementadas

- E-mail de usuário é único.
- Título de tarefa é único em toda a aplicação, não apenas por usuário.
- Toda tarefa deve pertencer a um usuário existente.
- Uma tarefa pode ser transferida para outro usuário existente.
- Um usuário com tarefas não pode ser excluído.
- Alterar ou excluir usuário exige que x-user-id seja igual ao id da rota.
- Todas as falhas que chegam ao middleware global são tentativamente registradas no MongoDB.

## Limitações e recomendações

- Implementar autenticação real e derivar a identidade de token ou sessão, removendo a confiança em x-user-id.
- Validar payloads com schemas e rejeitar campos/tipos inesperados.
- Avaliar a troca de age: String por data de nascimento ou inteiro validado.
- Mascarar informações sensíveis antes de persistir logs no MongoDB.
- Adicionar encerramento gracioso para desconectar Prisma e MongoDB.
- Adicionar health checks separados para API, PostgreSQL e MongoDB.
- Configurar PORT por variável de ambiente.
- Criar testes unitários, de integração e de contrato HTTP; o projeto não possui suíte de testes atualmente.
- Avaliar se o título deve ser único globalmente ou apenas dentro de cada usuário.

## Estrutura do projeto

text
.
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- errors/
|   |-- middlewares/
|   |-- routes/
|   `-- services/
|-- docker-compose.yml
|-- prisma.config.ts
|-- server.ts
|-- package.json
`-- tsconfig.json