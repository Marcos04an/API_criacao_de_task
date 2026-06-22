const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API de Usuários e Tarefas',
        version: '1.0.0',
        description: 'Documentação da API com relacionamento entre usuários e tarefas.'
    },
    servers: [
        {
            url: 'http://localhost:3000/api-docs/',
            description: 'Servidor local'
        }
    ],
    tags: [
        {
            name: 'Usuários',
            description: 'Operações relacionadas ao cadastro de usuários'
        },
        {
            name: 'Tarefas',
            description: 'Operações relacionadas às tarefas vinculadas aos usuários'
        }
    ],
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'b5b1c1f2-4d2f-4f7d-9b7f-2f1c8a7d1234'
                    },
                    email: {
                        type: 'string',
                        example: 'maria@email.com'
                    },
                    name: {
                        type: 'string',
                        example: 'Maria Silva'
                    },
                    age: {
                        type: 'string',
                        example: '25'
                    }
                }
            },
            CreateUser: {
                type: 'object',
                required: ['email', 'name', 'age'],
                properties: {
                    email: {
                        type: 'string',
                        example: 'maria@email.com'
                    },
                    name: {
                        type: 'string',
                        example: 'Maria Silva'
                    },
                    age: {
                        type: 'string',
                        example: '25'
                    }
                }
            },
            Task: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'f7b4a491-8d63-4f84-8d32-7a930f3b5678'
                    },
                    title: {
                        type: 'string',
                        example: 'Estudar integridade relacional'
                    },
                    description: {
                        type: 'string',
                        nullable: true,
                        example: 'Revisar relacionamento User 1:N Task'
                    },
                    completed: {
                        type: 'boolean',
                        example: false
                    },
                    userId: {
                        type: 'string',
                        example: 'b5b1c1f2-4d2f-4f7d-9b7f-2f1c8a7d1234'
                    }
                }
            },
            CreateTask: {
                type: 'object',
                required: ['title', 'userId'],
                properties: {
                    title: {
                        type: 'string',
                        example: 'Estudar Swagger'
                    },
                    description: {
                        type: 'string',
                        example: 'Criar documentação da API'
                    },
                    completed: {
                        type: 'boolean',
                        example: false
                    },
                    userId: {
                        type: 'string',
                        example: 'b5b1c1f2-4d2f-4f7d-9b7f-2f1c8a7d1234'
                    }
                }
            },
            UpdateTask: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        example: 'Estudar Swagger atualizado'
                    },
                    description: {
                        type: 'string',
                        example: 'Atualizar exemplos da documentação'
                    },
                    completed: {
                        type: 'boolean',
                        example: true
                    },
                    userId: {
                        type: 'string',
                        example: 'b5b1c1f2-4d2f-4f7d-9b7f-2f1c8a7d1234'
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        example: 'Mensagem de erro'
                    }
                }
            },
            SuccessMessage: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Operação realizada com sucesso!'
                    }
                }
            }
        },
        parameters: {
            UserIdHeader: {
                name: 'x-user-id',
                in: 'header',
                required: true,
                description: 'ID do usuário autenticado usado para validar permissão de update/delete.',
                schema: {
                    type: 'string'
                }
            }
        }
    },
    paths: {
        '/usuarios': {
            post: {
                tags: ['Usuários'],
                summary: 'Cria um usuário',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateUser'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Usuário criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Dados obrigatórios não informados',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error'
                                }
                            }
                        }
                    },
                    409: {
                        description: 'E-mail já cadastrado',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error'
                                }
                            }
                        }
                    }
                }
            },
            get: {
                tags: ['Usuários'],
                summary: 'Lista usuários',
                parameters: [
                    {
                        name: 'name',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'string'
                        }
                    },
                    {
                        name: 'email',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'string'
                        }
                    },
                    {
                        name: 'age',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Lista de usuários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/User'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/usuarios/{id}': {
            put: {
                tags: ['Usuários'],
                summary: 'Atualiza um usuário',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    },
                    {
                        $ref: '#/components/parameters/UserIdHeader'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateUser'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Usuário atualizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Usuário autenticado não informado'
                    },
                    403: {
                        description: 'Usuário não tem permissão para alterar esta conta'
                    },
                    404: {
                        description: 'Usuário não encontrado'
                    },
                    409: {
                        description: 'E-mail já cadastrado'
                    }
                }
            },
            delete: {
                tags: ['Usuários'],
                summary: 'Deleta um usuário',
                description: 'Não permite deletar um usuário que possui tarefas vinculadas.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    },
                    {
                        $ref: '#/components/parameters/UserIdHeader'
                    }
                ],
                responses: {
                    200: {
                        description: 'Usuário deletado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SuccessMessage'
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Usuário autenticado não informado'
                    },
                    403: {
                        description: 'Usuário não tem permissão para deletar esta conta'
                    },
                    404: {
                        description: 'Usuário não encontrado'
                    },
                    409: {
                        description: 'Usuário possui tarefas vinculadas'
                    }
                }
            }
        },
        '/tasks': {
            post: {
                tags: ['Tarefas'],
                summary: 'Cria uma tarefa vinculada a um usuário',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateTask'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Tarefa criada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Task'
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Título ou ID do usuário não informado'
                    },
                    404: {
                        description: 'Usuário relacionado não encontrado'
                    }
                }
            },
            get: {
                tags: ['Tarefas'],
                summary: 'Lista tarefas com seus usuários relacionados',
                responses: {
                    200: {
                        description: 'Lista de tarefas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        allOf: [
                                            {
                                                $ref: '#/components/schemas/Task'
                                            },
                                            {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        $ref: '#/components/schemas/User'
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/tasks/{id}': {
            put: {
                tags: ['Tarefas'],
                summary: 'Atualiza uma tarefa',
                description: 'Se o userId for alterado, a API valida se o novo usuário existe.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateTask'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Tarefa atualizada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Task'
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Tarefa ou usuário relacionado não encontrado'
                    }
                }
            },
            delete: {
                tags: ['Tarefas'],
                summary: 'Deleta uma tarefa',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Tarefa deletada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SuccessMessage'
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Tarefa não encontrada'
                    }
                }
            }
        }
    }
}

export default swaggerDocument
