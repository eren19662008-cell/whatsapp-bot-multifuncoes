# 🤖 Bot Multifunções para WhatsApp

Um bot de WhatsApp para diversão, zoeira, media e administração de grupos. Ele foi pensado para funcionar como um assistente de grupo com comandos simples e personalizados.

## Recursos principais

- `.menu` — mostra todos os comandos
- `.ping` — verifica se o bot está online
- `.play` — busca músicas / vídeos por tema
- `.yt` — busca vídeos no YouTube
- `.tts` — transforma texto em áudio
- `.sticker` / `.s` — transforma imagem/vídeo em figurinha
- `.take` — personaliza a figurinha com nome e autor
- `.toimg` — informa e orienta sobre conversão de figurinha
- `.tagall` — marca todos os membros do grupo
- `.hidetag` — marca todos sem mostrar os nomes visivelmente
- `.antilink` — ativa ou desativa proteção contra links
- `.welcome` / `.goodbye` — mensagens automáticas de entrada/saída
- `.mute` — silencia comandos do grupo
- `.ban` / `.promote` / `.demote` — funções administrativas do grupo

## Requisitos

- Node.js 18+
- Uma conta do WhatsApp ativa
- Um celular para escanear o QR Code

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

## Primeiro uso

1. Execute o projeto.
2. Escaneie o QR Code exibido no terminal com o WhatsApp.
3. Use comandos no grupo ou na conversa direta com o bot.

## Estrutura do projeto

```text
.
├── auth/
├── data/
├── src/
│   ├── config.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## Observações importantes

- O bot usa a biblioteca Baileys, que é uma solução bastante estável para WhatsApp no Node.js.
- Algumas funções de mídia dependem do tipo de arquivo enviado e da disponibilidade do serviço externo.
- Para uso em produção com maior segurança, vale usar a API oficial do WhatsApp Business / Meta Cloud.

## Licença

MIT
