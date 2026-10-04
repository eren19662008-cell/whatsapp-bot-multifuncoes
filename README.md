# 🤖 eren bot - Bot WhatsApp com IA GPT-4o

Um bot super inteligente e divertido para WhatsApp com IA poderosa (GPT-4o), comandos incríveis e muita zoação!

## 🚀 Como Começar

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar a chave da IA
O arquivo `.env` já está criado. Você só precisa adicionar sua chave da OpenAI:

```bash
# Abra o arquivo .env e coloque sua chave:
AI_API_KEY="sua_chave_openai_aqui"
```

**Como conseguir a chave:**
1. Vá em https://platform.openai.com/account/api-keys
2. Clique em "Create new secret key"
3. Copie a chave e cole no `.env`

### 3️⃣ Rodar o bot
```bash
npm start
```

### 4️⃣ Escanear o QR Code
- Aparecerá um QR code no terminal
- Abra o WhatsApp no seu celular
- Escaneie o QR code
- O bot entra na sua conta!

## 📋 Comandos do eren bot

### 💬 IA & Diversão
- `.ia mensagem` — fala com a IA
- `.piada` — conta uma piada engraçada
- `.charada` — envia uma charada
- `.desafio` — gera um desafio para jogo
- Mensagens normais também são respondidas pela IA! 🤖

### 🎵 Mídia
- `.play música` — busca música no YouTube
- `.yt vídeo` — busca vídeo no YouTube
- `.tts texto` — transforma em áudio
- `.s` ou `.sticker` — cria figurinha de imagem/vídeo
- `.take nome` — personaliza a figurinha

### 👥 Grupo
- `.tagall` — marca todos
- `.hidetag` — marca todos discretamente
- `.antilink` — ativa proteção contra links
- `.welcome` — ativa mensagem de boas-vindas
- `.goodbye` — ativa mensagem de despedida
- `.mute` — silencia comandos do grupo
- `.unmute` — reativa comandos

### 🔐 Admin Only
- `.ban @user` — remove do grupo
- `.promote @user` — promove a admin
- `.demote @user` — remove admin
- `.ia_off` — desativa IA no grupo
- `.ia_on` — ativa IA no grupo

### ℹ️ Utilitários
- `.menu` — mostra todos os comandos
- `.ping` — verifica se está online

## ⚙️ Configuração (.env)

```env
BOT_NAME="eren bot"
COMMAND_PREFIX="."
OWNER_NUMBER="27719523458"
AI_MODEL="gpt-4o"
AI_API_KEY="sua_chave_openai_aqui"
```

## 🤖 IA Integrada

- **Modelo:** GPT-4o (a melhor IA disponível)
- **Idioma:** Português do Brasil
- **Personalidade:** Criativa, divertida, sarcástica
- **Respostas:** Breves, com emojis, engraçadas
- **Segurança:** Recusa conteúdo ofensivo/perigoso

## 📦 Estrutura do Projeto

```
whatsapp-bot-multifuncoes/
├── src/
│   ├── index.js      # Bot principal
│   ├── config.js     # Configurações
│   └── ai.js         # Integração IA
├── auth/             # Autenticação (gerado)
├── data/             # Dados (gerado)
├── .env              # Variáveis (CRIE AQUI)
├── .env.example      # Exemplo
├── package.json      # Dependências
└── README.md         # Este arquivo
```

## 💡 Dicas

- O bot funciona melhor com a chave da OpenAI válida
- Em grupos, use `.ia_off` e `.ia_on` para controlar a IA
- O prefixo é `.` (ponto) para todos os comandos
- Mensagens normais também são respondidas pela IA
- Use `.menu` para ver todos os comandos

## ⚠️ Requisitos

- Node.js 18+
- Chave da OpenAI (grátis ou paga)
- WhatsApp ativo no celular

## 🔧 Troubleshooting

**"IA não configurada"**
- Coloque a chave no `.env`

**"QR Code não aparece"**
- Delete a pasta `auth/` e tente novamente

**"Bot não responde"**
- Use `.mute` para verificar se está ativado
- Confirme que `AI_API_KEY` é válida

## 📝 Licença

MIT

---

**Criado por:** eren bot  
**Desenvolvido com ❤️ para diversão no WhatsApp**
