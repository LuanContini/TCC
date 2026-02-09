# Sistema de Gestão e Reconhecimento Facial para Clínica

> **Trabalho de Conclusão de Curso (TCC)** - IFSP  
> Autores: Luan Contini e Antonio  
> Data: 2025

## Sumário Executivo

Este projeto é uma **aplicação web completa para gestão clínica com reconhecimento facial integrado**. Combina um backend robusto em Python/Flask com um frontend moderno em React, oferecendo funcionalidades de agendamento, gerenciamento de pacientes, atendimentos, e autenticação por reconhecimento facial.

---

## Objetivo e Justificativa

### Por que este projeto existe?

A gestão eficiente de clínicas enfrenta desafios operacionais críticos:

1. **Autenticação segura**: Necessidade de métodos seguros e práticos de verificação de identidade
2. **Controle de acesso**: Diferentes funções (administrador, profissional, paciente) requerem controles específicos
3. **Gestão de agendamentos**: Organização eficiente de horários entre profissionais e pacientes
4. **Rastreabilidade**: Histórico completo de atendimentos e procedimentos
5. **Privacidade**: Proteção de dados sensíveis de saúde

### Como este projeto resolve?

- ✅ **Reconhecimento facial** para autenticação rápida e segura
- ✅ **Controle de acesso baseado em roles** (admin, profissional, paciente)
- ✅ **Gestão integrada** de agendamentos, pacientes e atendimentos
- ✅ **API RESTful** padronizada para comunicação frontend-backend
- ✅ **Interface intuitiva** com React para melhor experiência do usuário

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Dashboard • Agendamentos • Pacientes • Profissionais   │   │
│  │ • Reconhecimento Facial • Relatórios • Autenticação      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ (HTTP/REST)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                        API (Flask)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Autenticação (JWT + Facial Recognition)                │   │
│  │ • Rotas CRUD (Pacientes, Agendamentos, Atendimentos)     │   │
│  │ • Processamento de Imagens (InsightFace + FAISS)         │   │
│  │ • Validação de Dados (Marshmallow)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ (SQL)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│               Banco de Dados (MySQL)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Usuários • Pacientes • Profissionais                   │   │
│  │ • Agendamentos • Atendimentos • Embeddings Faciais       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
TCC/
├── backend/                    # API Python/Flask
│   ├── main.py                # Ponto de entrada da aplicação
│   ├── requirements.txt        # Dependências Python
│   ├── .env                   # Variáveis de ambiente
│   │
│   └── app/                   # Aplicação Flask
│       ├── __init__.py        # Factory pattern - criação da app
│       ├── config.py          # Configurações
│       ├── database.py        # Inicialização do banco de dados
│       │
│       ├── models/            # Modelos de dados (ORM SQLAlchemy)
│       │   ├── usuario.py     # Usuários (admin, profissional, paciente)
│       │   ├── paciente.py    # Dados dos pacientes
│       │   ├── profissional.py# Dados dos profissionais
│       │   ├── agendamento.py # Agendamentos de atendimento
│       │   └── atendimento.py # Registros de atendimentos realizados
│       │
│       ├── routes/            # Rotas/Endpoints da API
│       │   ├── auth.py        # Autenticação e login
│       │   ├── usuarios.py    # CRUD de usuários
│       │   ├── pacientes.py   # CRUD de pacientes
│       │   ├── profissionais.py# CRUD de profissionais
│       │   ├── agendamentos.py # CRUD de agendamentos
│       │   └── atendimentos.py # CRUD de atendimentos
│       │
│       ├── schemas/           # Validação de dados (Marshmallow)
│       │   ├── usuario.py     # Schema de usuário
│       │   ├── paciente.py    # Schema de paciente
│       │   ├── profissional.py# Schema de profissional
│       │   ├── agendamentos.py# Schema de agendamento
│       │   └── atendimento.py # Schema de atendimento
│       │
│       ├── utils/             # Utilitários e funções auxiliares
│       │   ├── jwt_utils.py   # Geração/validação de JWT tokens
│       │   ├── facial_recognition.py # IA para reconhecimento facial
│       │   └── error_handler.py     # Tratamento centralizado de erros
│       │
│       ├── tests/             # Testes
│       │   ├── teste_pipeline.py
│       │   └── faces/         # Imagens de teste
│       │
│       └── uploads/           # Armazenamento de arquivos
│           └── faces/         # Fotos dos rostos dos usuários
│
├── frontend/                   # Aplicação React + Vite
│   ├── package.json           # Dependências JavaScript
│   ├── vite.config.js         # Configuração Vite
│   ├── index.html             # HTML principal
│   │
│   ├── public/                # Arquivos estáticos
│   │   └── models/            # Modelos de IA (TensorFlow.js, face-api.js)
│   │
│   └── src/
│       ├── main.jsx           # Ponto de entrada React
│       ├── App.jsx            # Componente raiz
│       ├── routes.jsx         # Definição de rotas
│       │
│       ├── pages/             # Páginas da aplicação
│       │   ├── Login/         # Tela de login com reconhecimento facial
│       │   ├── Dashboard/     # Painel principal
│       │   ├── Pacientes/     # Gestão de pacientes
│       │   ├── Profissionais/ # Gestão de profissionais
│       │   ├── Agendamentos/  # Gestão de agendamentos
│       │   ├── Atendimento/   # Registro de atendimentos
│       │   ├── ReconhecimentoFacial/ # Cadastro biométrico
│       │   ├── Relatorios/    # Análise e relatórios
│       │   └── Usuarios/      # Gestão de usuários
│       │
│       ├── components/        # Componentes reutilizáveis
│       │   ├── Navbar.jsx     # Barra de navegação
│       │   ├── Sidebar.jsx    # Menu lateral
│       │   ├── DataTable.jsx  # Tabela de dados
│       │   ├── FormField.jsx  # Campo de formulário
│       │   ├── WebcamViewer.jsx # Visualizador de câmera
│       │   └── FormErrors.jsx # Exibidor de erros
│       │
│       ├── services/          # Chamadas API
│       │   ├── api.js         # Cliente HTTP Axios
│       │   ├── auth.js        # Serviços de autenticação
│       │   ├── pacientes.js   # Serviços de pacientes
│       │   ├── profissionais.js
│       │   ├── agendamentos.js
│       │   ├── atendimento.js
│       │   └── reports.js     # Serviços de relatórios
│       │
│       ├── context/           # Context API (estado global)
│       │   └── AuthContext.jsx# Estado de autenticação
│       │
│       ├── hooks/             # Hooks customizados
│       │   └── useFormHandler.js
│       │
│       ├── styles/            # Estilos CSS/Tailwind
│       │   ├── index.css
│       │   ├── tokens.js      # Tokens de design
│       │   └── utils.js
│       │
│       ├── utils/             # Utilitários JavaScript
│       │   ├── constants.js   # Constantes
│       │   └── formStyles.js  # Estilos de formulários
│       │
│       └── validations/       # Schemas de validação (Yup)
│           └── (validações de formulários)
```

---

## Funcionalidades Principais

### 1. **Autenticação e Segurança**
- 🔐 Login com email/senha
- 👤 Autenticação por reconhecimento facial (InsightFace)
- 🎫 JWT tokens para sessões seguras
- 👥 Controle de acesso baseado em roles (RBAC):
  - **Admin**: Acesso total ao sistema
  - **Profissional**: Gerencia seus agendamentos e atendimentos
  - **Paciente**: Visualiza seus agendamentos

### 2. **Gestão de Pacientes**
- ✏️ CRUD completo (criar, ler, atualizar, deletar)
- 📋 Armazenamento de dados: CPF, RG, endereço, contato
- 🩺 Informações de saúde: tipo sanguíneo, alergias, histórico de doenças
- 📸 Armazenamento de foto para reconhecimento facial

### 3. **Gestão de Profissionais**
- ✏️ Cadastro e gerenciamento de profissionais
- 🏢 Dados de especialização
- 📞 Contato e horário de funcionamento
- 📅 Relação com agendamentos

### 4. **Agendamentos**
- 📅 Reserva de horários com profissionais
- 🔔 Filtros por data, profissional, paciente e status
- ✅ Estados: Agendado, Realizado, Cancelado
- 📊 Histórico completo de agendamentos

### 5. **Atendimentos**
- 📝 Registro de procedimentos realizados
- 🕐 Data/hora de início e fim
- 📄 Descrição do atendimento
- 💊 Anotações e observações médicas

### 6. **Reconhecimento Facial**
- 📸 Cadastro de biometria (rosto do paciente/profissional)
- 🔍 Comparação de faces com FAISS (busca de embeddings)
- 🤖 Extração de embeddings 512D usando InsightFace
- ✅ Validação automática de identidade

### 7. **Relatórios**
- 📊 Dashboard com estatísticas
- 📈 Gráficos de agendamentos e atendimentos
- 🔍 Filtros e exportação de dados

---

## Stack Tecnológico

### Backend
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Flask** | 3.0.3 | Framework web principal |
| **SQLAlchemy** | 2.0.31 | ORM para banco de dados |
| **Flask-JWT-Extended** | - | Autenticação com JWT |
| **InsightFace** | 0.7.3 | Reconhecimento facial (embeddings) |
| **FAISS** | 1.8.0 | Busca rápida de similaridade facial |
| **OpenCV** | 4.10.0.84 | Processamento de imagens |
| **Marshmallow** | 4.0.0 | Validação e serialização de dados |
| **PyMySQL** | 1.1.1 | Conexão com MySQL |

### Frontend
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **React** | 19.1.1 | Framework UI |
| **Vite** | 7.1.2 | Build tool e dev server |
| **React Router** | 7.8.0 | Roteamento |
| **Tailwind CSS** | 4.1.12 | Estilização |
| **Axios** | 1.11.0 | Cliente HTTP |
| **Face-API.js** | 0.22.2 | Detecção facial no navegador |
| **TensorFlow.js** | 4.22.0 | Machine learning no browser |
| **React Hook Form** | 7.62.0 | Gestão de formulários |
| **Yup** | 1.7.0 | Validação de schemas |

### Banco de Dados
- **MySQL** - Banco de dados relacional

---

## Como Usar

### Pré-requisitos
- Node.js 16+ (para frontend)
- Python 3.9+ (para backend)
- MySQL 8.0+
- Git

### 1. Configurar Backend

```bash
# Entrar no diretório backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações de banco de dados e JWT

# Executar servidor (em desenvolvimento)
python main.py
```

O backend rodará em `http://localhost:5000`

### 2. Configurar Frontend

```bash
# Entrar no diretório frontend
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

O frontend rodará em `http://localhost:5173`

### 3. Acessar a Aplicação

1. Abrir navegador: `http://localhost:5173`
2. Fazer login com:
   - **Email**: admin@clinica.com
   - **Senha**: (configurada no .env)
3. Ou usar reconhecimento facial se a foto foi cadastrada

---

## Modelos de Dados

### Usuário
```
- idUsuario (PK)
- nome
- email (UNIQUE)
- senha_hash
- role (admin | profissional | paciente)
- ativo
- criadoEm
- atualizadoEm
```

### Paciente
```
- idPaciente (PK)
- nomeComp
- cpf (UNIQUE)
- rg
- dataNasc
- sexo
- endereço (logradouro, numero, bairro, cidade, estado, cep)
- telefone
- email
- tipo sanguíneo
- alergias
- histórico de doenças
- status
- criadoEm
- atualizadoEm
```

### Profissional
```
- idProfissional (PK)
- nome
- especialidade
- crm (Conselho Regional de Medicina)
- telefone
- email
- horárioAtendimento
- ativo
- criadoEm
- atualizadoEm
```

### Agendamento
```
- idAgendamento (PK)
- idPaciente (FK)
- idProfissional (FK)
- horario
- status (agendado | realizado | cancelado)
- observacao
- criadoEm
- atualizadoEm
```

### Atendimento
```
- idAtendimento (PK)
- idAgendamento (FK)
- dataHoraInicio
- dataHoraFim
- descricao
- observacao
- criadoEm
- atualizadoEm
```

---

## Endpoints da API

### Autenticação
- `POST /auth/login` - Login com email/senha
- `POST /auth/login-facial` - Login com reconhecimento facial
- `GET /auth/me` - Obter dados do usuário autenticado
- `POST /auth/logout` - Logout

### Pacientes
- `GET /pacientes` - Listar pacientes
- `POST /pacientes` - Criar paciente
- `GET /pacientes/<id>` - Obter detalhes
- `PUT /pacientes/<id>` - Atualizar
- `DELETE /pacientes/<id>` - Deletar

### Agendamentos
- `GET /agendamentos` - Listar agendamentos
- `POST /agendamentos` - Criar agendamento
- `GET /agendamentos/<id>` - Obter detalhes
- `PUT /agendamentos/<id>` - Atualizar
- `DELETE /agendamentos/<id>` - Cancelar

### Atendimentos
- `GET /atendimentos` - Listar atendimentos
- `POST /atendimentos` - Registrar atendimento
- `GET /atendimentos/<id>` - Obter detalhes
- `PUT /atendimentos/<id>` - Atualizar

### Reconhecimento Facial
- `POST /faces/register` - Cadastrar rosto
- `POST /faces/compare` - Comparar rostos
- `POST /faces/identify` - Identificar pessoa

---

## Como Funciona o Reconhecimento Facial

### Fluxo de Cadastro
1. Usuário captura foto via webcam
2. Frontend envia imagem para backend
3. Backend extrai embedding 512D usando InsightFace (modelo buffalo_l)
4. Embedding é normalizado e adicionado ao índice FAISS
5. ID do usuário é mapeado ao embedding

### Fluxo de Autenticação
1. Usuário habilita câmera no login
2. Sistema captura foto do rosto
3. Backend extrai embedding da foto
4. Compara com FAISS usando distância euclidiana (L2)
5. Se similaridade > threshold, autentica usuário
6. JWT token é gerado e retornado

### Tecnologias Utilizadas
- **InsightFace**: Modelo deep learning (ArcFace) para extrair embeddings faciais robustos
- **FAISS**: Busca rápida em alta dimensão (512D)
- **OpenCV**: Pré-processamento de imagens
- **NumPy**: Operações numéricas e normalização

---

## Configuração de Ambiente (.env)

```env
# Database
DATABASE_URL=mysql+pymysql://usuario:senha@localhost/tcc_db

# JWT
JWT_SECRET_KEY=sua_chave_secreta_super_segura_aqui

# Admin padrão
ADMIN_PASSWORD=senha_forte_para_admin

# Flask
FLASK_ENV=development
FLASK_DEBUG=True

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## Testes

```bash
# Executar testes Python
cd backend
pytest tests/

# Executar linting
npm run lint
```

---

## Notas de Desenvolvimento

### Segurança
- Senhas são hasheadas com algoritmo bcrypt
- JWT tokens com expiração configurável
- CORS habilitado apenas para frontend local
- Validação de entrada em todos os endpoints

### Performance
- Índices em campos frequentemente consultados
- Cache de embeddings faciais com FAISS
- Paginação em listagens
- Lazy loading no frontend

### Boas Práticas
- Separação clara entre models, routes, schemas
- Error handling centralizado
- Validação de dados com Marshmallow
- Componentes React reutilizáveis

---


## Referências

- [Flask Documentation](https://flask.palletsprojects.com/)
- [InsightFace GitHub](https://github.com/deepinsight/insightface)
- [FAISS Documentation](https://faiss.ai/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Licença

Este projeto é de uso acadêmico (TCC). Consulte a instituição para termos de uso.

---

## Autores

**Luan e Antonio**  
Instituto Federal de Educação, Ciência e Tecnologia de São Paulo (IFSP)  
2025

---

**Última atualização**: Dezembro de 2025
