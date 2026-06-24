# project-conventions Specification

## Purpose

Estabelece convenções de arquitetura e acesso a dados do projeto: mutations via Server Actions, leituras via Server Components, RLS como camada final de defesa e idioma de código/UI.

## Requirements

### Requirement: Mutations via Server Actions with Validation
Toda mutation (criar/editar/apagar) SHALL ser implementada como Server Action e MUST validar e sanitizar o input com Zod antes de tocar o banco.

#### Scenario: Mutation valida input
- **WHEN** uma Server Action de mutation recebe input do usuário
- **THEN** o input é validado por um schema Zod e rejeitado se inválido, antes de qualquer escrita no banco

### Requirement: Reads via Server Components
Leituras de página SHALL ser feitas em Server Components usando o server client do Supabase.

#### Scenario: Leitura server-side
- **WHEN** uma página precisa carregar dados
- **THEN** ela usa um Server Component com o `createServerClient`, não fetch client-side

### Requirement: RLS as Final Defense Layer
Toda tabela criada em changes futuras MUST ter RLS habilitado, e Server Actions/Route Handlers NÃO dispensam RLS — ele é a camada final de defesa.

#### Scenario: Nova tabela exige RLS
- **WHEN** uma change futura adiciona uma tabela
- **THEN** a tabela só é considerada conforme se tiver RLS habilitado com políticas explícitas

### Requirement: Code English, UI Portuguese
Código, nomes de tabelas, colunas e identificadores SHALL estar em inglês; conteúdo de UI voltado ao usuário PODE estar em português.

#### Scenario: Identificadores em inglês
- **WHEN** novo código ou schema é escrito
- **THEN** identificadores estão em inglês enquanto textos de UI podem estar em português
