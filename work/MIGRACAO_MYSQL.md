# Migração: obrigar email corporativo

Use o schema em `mysql-schema.sql` e aplique estas regras no backend:

## 1) Cadastro (`POST /api/auth/register`)
- Recebe `{ email, password }`.
- Busca email em `corporate_emails` com `active = 1`.
- Se não existir: retornar `403` com mensagem `Email corporativo não autorizado`.
- Se existir: criar usuário em `users` com:
  - `email` igual ao informado
  - `corporate_email_id` apontando para `corporate_emails.id`
  - `password_hash` (bcrypt/argon2)

SQL de validação:
```sql
SELECT id, email
FROM corporate_emails
WHERE email = ? AND active = 1
LIMIT 1;
```

## 2) Login (`POST /api/auth/login`)
- Valida usuário/senha em `users`.
- Confere se o email dele ainda está ativo em `corporate_emails`.
- Se corporate email desativado: bloquear login com `403`.

SQL recomendado:
```sql
SELECT u.id, u.email, u.password_hash, c.active
FROM users u
JOIN corporate_emails c ON c.id = u.corporate_email_id
WHERE u.email = ?
LIMIT 1;
```

## 3) Endpoint de administração (sugestão)
- `POST /api/corporate-emails` para adicionar emails autorizados.
- `PATCH /api/corporate-emails/:id` para ativar/desativar.
- `GET /api/corporate-emails` para listar.

## 4) Mapeamento com o front atual
- A aba `Email Corporativo` já existe no front.
- Na migração, trocar persistência local por chamadas API para os endpoints acima.

