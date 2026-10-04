# 🤖 Bot Multifunções para WhatsApp com IA

Um bot de WhatsApp com inteligência artificial integrada, comandos de entretenimento, automações de grupos e recursos de mídia.

## Recursos principais

- IA integrada com OpenAI para conversa livre
- `.menu` para listar comandos
- `.ping` para verificar online
- `.ia <mensagem>` para conversar com IA
- `.piada`, `.charada`, `.desafio` para diversão
- `.play <música>` e `.yt <vídeo>`
- `.tts <texto>` para áudio
- `.s` / `.sticker` para figurinha
- `.tagall` e `.hidetag`
- `.antilink`, `.welcome`, `.goodbye`, `.mute`, `.unmute`
- `.ban`, `.promote`, `.demote`

## Requisitos

- Node.js 18+
- um celular com WhatsApp
- chave da API OpenAI

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

## Variáveis de ambiente

```env
BOT_NAME="🤖 Bot de Brincadeiras"
COMMAND_PREFIX="."
OWNER_NUMBER="5521999999999"
AI_API_KEY="sua_chave_openai_aqui"
AI_MODEL="gpt-4o-mini"
```

## Como usar

- Escaneie o QR code no terminal
- Use comandos com prefixo `.`
- Mensagens normais também podem ser respondidas pela IA

## Observações

- Para o bot falar com a IA, a chave da API precisa estar válida.
- Em grupos, você pode desativar a IA com `.ia_off` e ativar com `.ia_on`.
- O foco é recreação, humor e automações de grupo de forma responsável.

## Licença

MIT
