# Labook Backend
* A API de backend da Labook oferece recursos para usuários e posts. As ações que a API pode realizar são para signup e login de usuário. Além do CRUD para os posts com intuito de criar, receber informações de posts, editar e deletar os posts. Além disso, temos um endpoint para likes e dislikes de posts.


## Tecnologias Utilizadas
* NodeJS
* Typescript
* Express
* SQL e SQLite
* Knex
* POO (Programação Orientada a Objetos)
* Arquitetura em Camadas
* Geração de UUID
* Geração de Hashes
* Autenticação e Autorização
* Roteamento

## Instalação
Após clonar o repositório no terminal dê um 'npm install' para instalar as dependências.

```
npm install
```

```
npm run knex:migrate
npm run knex:seed
```

### Uso

```
npm run dev
```
## Endpoints

### Usuários
POST /signup: Cria um novo usuário, recebe um nome, email e uma senha e devolve um token de autorização.
POST /login: Realiza o login do usuário, recebe um email e uma senha e devolve um token de autorização.

### Posts
GET /posts: Retorna a lista de posts em um array, com seu criador.
POST /posts: Cria um novo post, necessita um token de autorização para funcionar.
PUT /posts/:id: Edita as informações de um post existente, requer um token, somente os criadores do post podem editar.
DELETE /posts/:id: Deleta um post.

### Likes e Dislikes
POST /posts/:id/like: Adiciona um like a um post, se o post ja estiver com um like, retira. recebe um booleano.

### Autenticação e Autorização
O projeto utiliza a criação automática de uuid's na sua versão 4. A autenticação utiliza jsonwebtoken.
