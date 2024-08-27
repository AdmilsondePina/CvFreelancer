CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_image TEXT
);
-- Tabela Passwords resets
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, token)
);

-- Tabela Freelancers
CREATE TABLE freelancers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bio TEXT
);

-- Tabela Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_name VARCHAR(255)
);

-- Tabela Sistema de Mensagens
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Portifolio
CREATE TABLE portifolio (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    project_name VARCHAR(255),
    project_description TEXT,
    project_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Publicacao de Servico (freelancer)
CREATE TABLE publicacao_servico (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    availability BOOLEAN
);

-- Tabela Avaliacoes e Feedback
CREATE TABLE avaliacoes_feedback (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    cliente_id INTEGER REFERENCES clientes(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Morada
CREATE TABLE morada (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ilha VARCHAR(255),
    cidade VARCHAR(255),
    zona VARCHAR(255),
    endereco TEXT
);

-- Tabela Contacto
CREATE TABLE contacto (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email_contact VARCHAR(255),
    website_contact VARCHAR(255),
    facebook_contact VARCHAR(255),
    instagram_contact VARCHAR(255),
    linkedin_contact VARCHAR(255)
);

-- Tabela Contact_phone
CREATE TABLE contact_phone (
    id SERIAL PRIMARY KEY,
    contacto_id INTEGER REFERENCES contacto(id),
    phone VARCHAR(20),
    fix_telephone VARCHAR(20)
);

-- Tabela Publicacao de Oportunidades de Trabalho
CREATE TABLE publicacao_oportunidades (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    titulo VARCHAR(255),
    descricao TEXT,
    requisitos TEXT,
    prazo TIMESTAMP,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Candidaturas
CREATE TABLE candidaturas (
    id SERIAL PRIMARY KEY,
    oportunidade_id INTEGER REFERENCES publicacao_oportunidades(id),
    freelancer_id INTEGER REFERENCES freelancers(id),
    proposta TEXT,
    valor DECIMAL(10, 2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Dados Pessoais
CREATE TABLE dados_pessoais (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    nome VARCHAR(255),
    apelido VARCHAR(255),
    nif VARCHAR(50),
    cni VARCHAR(50)
);

-- Tabela Skill_freelancer
CREATE TABLE skill_freelancer (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    skill_id INTEGER REFERENCES skills(id),
    nivel VARCHAR(20) CHECK (nivel IN ('iniciante', 'pleno', 'expert'))
);

-- Tabela Education
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    degree VARCHAR(255),
    instituition VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT
);

-- Tabela Experience
CREATE TABLE experience (
    id SERIAL PRIMARY KEY,
    freelancer_id INTEGER REFERENCES freelancers(id),
    job_title VARCHAR(255),
    company VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT
);

-- Tabela Skills
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255)
);

-- Tabela Industry
CREATE TABLE industry (
    id SERIAL PRIMARY KEY,
    industry_name VARCHAR(255)
);

-- Tabela Clientes_Industry
CREATE TABLE clientes_industry (
    id SERIAL PRIMARY KEY,
    industry_id INTEGER REFERENCES industry(id),
    cliente_id INTEGER REFERENCES clientes(id)
);
