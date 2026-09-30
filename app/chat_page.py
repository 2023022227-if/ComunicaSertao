HTML_CHAT = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ComunicaSertão - Simulador WhatsApp</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background: #eae6df;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 10px;
    }

    .container {
      width: 100%;
      max-width: 520px;
      height: 94vh;
      max-height: 840px;
      background: #efeae2;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      border: 1px solid #d1d7db;
    }

    /* HEADER */
    .chat-header {
      background: #005c4b;
      color: #fff;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #25d366;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .header-info {
      flex: 1;
    }

    .header-info h2 {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .header-info p {
      font-size: 12px;
      color: #d1f4cc;
      margin-top: 2px;
    }

    .header-badges {
      display: flex;
      gap: 8px;
    }

    .badge-link {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      font-size: 11px;
      padding: 5px 9px;
      border-radius: 12px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .badge-link:hover {
      background: rgba(255, 255, 255, 0.35);
    }

    /* BARRA DE TELEFONE SIMULADO */
    .phone-bar {
      background: #f0f2f5;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #54656f;
      border-bottom: 1px solid #e9edef;
    }

    .phone-bar input {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 13px;
      width: 140px;
      outline: none;
    }

    .btn-reset {
      background: #f15c5c;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      margin-left: auto;
    }

    .btn-reset:hover {
      background: #d94343;
    }

    /* ÁREA DE MENSAGENS */
    .messages-area {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-image: radial-gradient(#d4cdc3 1px, transparent 1px);
      background-size: 16px 16px;
      background-color: #efeae2;
    }

    .msg {
      max-width: 82%;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14.2px;
      line-height: 1.45;
      position: relative;
      word-wrap: break-word;
      white-space: pre-wrap;
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
    }

    .msg-bot {
      background: #ffffff;
      align-self: flex-start;
      border-top-left-radius: 0;
      color: #111b21;
    }

    .msg-user {
      background: #d9fdd3;
      align-self: flex-end;
      border-top-right-radius: 0;
      color: #111b21;
    }

    .msg-time {
      display: block;
      font-size: 10.5px;
      color: #667781;
      text-align: right;
      margin-top: 4px;
    }

    .msg-img {
      max-width: 100%;
      max-height: 220px;
      border-radius: 8px;
      display: block;
      margin-bottom: 6px;
      object-fit: cover;
      border: 1px solid rgba(0,0,0,0.1);
    }

    /* BOTÕES DE SUGESTÃO / ATALHOS */
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 14px;
      background: #f7f7f7;
      border-top: 1px solid #e1e1e1;
    }

    .quick-btn {
      background: #e9edef;
      border: 1px solid #d1d7db;
      border-radius: 14px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
      color: #111b21;
      transition: all 0.2s;
    }

    .quick-btn:hover {
      background: #005c4b;
      color: white;
      border-color: #005c4b;
    }

    /* ÁREA DE INPUT */
    .input-area {
      background: #f0f2f5;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-area input[type="text"] {
      flex: 1;
      padding: 10px 14px;
      border-radius: 20px;
      border: none;
      outline: none;
      font-size: 14px;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .btn-attach {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid #d1d7db;
      background: #ffffff;
      color: #54656f;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      transition: all 0.2s;
    }

    .btn-attach:hover {
      background: #e9edef;
      color: #005c4b;
      border-color: #005c4b;
    }

    .btn-send {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: #00a884;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: background 0.2s;
    }

    .btn-send:hover {
      background: #008f6f;
    }

    .typing-indicator {
      display: none;
      align-self: flex-start;
      background: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      color: #667781;
      font-style: italic;
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- CABEÇALHO -->
    <header class="chat-header">
      <div class="avatar">🏛️</div>
      <div class="header-info">
        <h2>ComunicaSertão (Oficial)</h2>
        <p>Prefeitura Municipal de Sertão - RS</p>
      </div>
      <div class="header-badges">
        <a href="/docs" target="_blank" class="badge-link" title="Ver Swagger da API">📄 Swagger</a>
        <a href="/ocorrencias" target="_blank" class="badge-link" title="Ver lista em JSON">📋 Ocorrências</a>
      </div>
    </header>

    <!-- BARRA DO CIDADÃO -->
    <div class="phone-bar">
      <span>📱 Telefone simulado:</span>
      <input type="text" id="inputTelefone" value="54999887766">
      <button class="btn-reset" onclick="reiniciarFluxo()">Reiniciar Chat</button>
    </div>

    <!-- ÁREA DE MENSAGENS -->
    <div class="messages-area" id="chatArea">
      <div class="typing-indicator" id="typingIndicator">ComunicaSertão está digitando...</div>
    </div>

    <!-- ATALHOS RÁPIDOS -->
    <div class="quick-actions">
      <span style="font-size: 11px; color: #667781; align-self: center; margin-right: 4px;">Atalhos:</span>
      <button class="quick-btn" onclick="enviarMensagemPre('Oi')">Oi</button>
      <button class="quick-btn" onclick="enviarMensagemPre('1')">1 (Iluminação)</button>
      <button class="quick-btn" onclick="enviarMensagemPre('2')">2 (Buraco)</button>
      <button class="quick-btn" onclick="enviarMensagemPre('3')">3 (Saneamento)</button>
      <button class="quick-btn" onclick="enviarMensagemPre('Pular')">Pular Foto</button>
    </div>

    <!-- CAMPO DE DIGITAÇÃO -->
    <form class="input-area" onsubmit="event.preventDefault(); enviarMensagem();">
      <!-- Botão para escolher foto -->
      <button type="button" class="btn-attach" onclick="document.getElementById('fileInput').click()" title="Anexar Foto da Ocorrência">📷</button>
      <input type="file" id="fileInput" accept="image/*" style="display:none;" onchange="enviarFotoSelecionada(event)">

      <input 
        type="text" 
        id="inputMensagem" 
        placeholder="Digite uma mensagem como cidadão..." 
        autocomplete="off"
        autofocus
      />
      <button type="submit" class="btn-send" title="Enviar">➤</button>
    </form>
  </div>

  <script>
    const chatArea = document.getElementById("chatArea");
    const inputMensagem = document.getElementById("inputMensagem");
    const inputTelefone = document.getElementById("inputTelefone");
    const typingIndicator = document.getElementById("typingIndicator");

    function obterHoraAtual() {
      const agora = new Date();
      return agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function adicionarMensagem(texto, remetente = "bot", urlFoto = null) {
      const div = document.createElement("div");
      div.className = `msg msg-${remetente}`;
      
      let htmlInterno = "";

      if (urlFoto) {
        htmlInterno += `<a href="${urlFoto}" target="_blank"><img src="${urlFoto}" class="msg-img" alt="Foto da Ocorrência"></a>`;
      }

      if (texto) {
        let formatado = texto.replace(/\\*(.*?)\\*/g, '<strong>$1</strong>');
        formatado = formatado.replace(/`(.*?)`/g, '<code style="background:#eef;padding:2px 4px;border-radius:4px;">$1</code>');
        htmlInterno += formatado;
      }

      htmlInterno += `<span class="msg-time">${obterHoraAtual()}</span>`;
      div.innerHTML = htmlInterno;
      
      chatArea.insertBefore(div, typingIndicator);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    async function enviarMensagem(urlFotoPrevia = null) {
      const texto = inputMensagem.value.trim();
      const telefone = inputTelefone.value.trim();

      if (!texto && !urlFotoPrevia) return;

      if (texto) {
        adicionarMensagem(texto, "user");
      }
      inputMensagem.value = "";
      inputMensagem.focus();

      typingIndicator.style.display = "block";
      chatArea.scrollTop = chatArea.scrollHeight;

      try {
        const resposta = await fetch("/simulador/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefone: telefone,
            mensagem: texto || "Foto anexada",
            url_foto: urlFotoPrevia
          })
        });

        const dados = await resposta.json();
        
        setTimeout(() => {
          typingIndicator.style.display = "none";
          adicionarMensagem(dados.resposta_bot, "bot");
        }, 350);

      } catch (err) {
        typingIndicator.style.display = "none";
        adicionarMensagem("❌ Erro ao conectar com o servidor da API.", "bot");
      }
    }

    async function enviarFotoSelecionada(event) {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      const formData = new FormData();
      formData.append("arquivo", arquivo);

      typingIndicator.style.display = "block";
      chatArea.scrollTop = chatArea.scrollHeight;

      try {
        const uploadResp = await fetch("/upload/foto", {
          method: "POST",
          body: formData
        });

        if (!uploadResp.ok) {
          throw new Error("Falha no upload da foto");
        }

        const dataUpload = await uploadResp.json();
        const urlFoto = dataUpload.url;

        // Exibe a foto no balão do usuário
        adicionarMensagem("📸 Foto enviada:", "user", urlFoto);

        // Envia para o bot
        const telefone = inputTelefone.value.trim();
        const respChat = await fetch("/simulador/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telefone: telefone,
            mensagem: "Foto enviada",
            url_foto: urlFoto
          })
        });

        const dadosChat = await respChat.json();
        setTimeout(() => {
          typingIndicator.style.display = "none";
          adicionarMensagem(dadosChat.resposta_bot, "bot");
        }, 350);

      } catch (e) {
        typingIndicator.style.display = "none";
        adicionarMensagem("⚠️ Erro ao enviar foto: " + e.message, "bot");
      } finally {
        event.target.value = "";
      }
    }

    function enviarMensagemPre(texto) {
      inputMensagem.value = texto;
      enviarMensagem();
    }

    async function reiniciarFluxo() {
      inputMensagem.value = "reiniciar";
      await enviarMensagem();
    }

    // Ao carregar a página pela primeira vez, inicia a conversa automaticamente
    window.onload = () => {
      enviarMensagemPre("Oi");
    };
  </script>
</body>
</html>
"""
