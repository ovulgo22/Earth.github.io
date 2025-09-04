/* =================================================================== */
/* A CRÔNICA DA HUMANIDADE - SCRIPT PRINCIPAL (main.js) V1.0           */
/* =================================================================== */
/* Equipe: Creative Tech, Full-Stack, Interactive Dev, UX, A11y        */
/* =================================================================== */

// UX: Espera o DOM estar totalmente carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // ===============================================================
    // 1. SELEÇÃO DE ELEMENTOS DO DOM E ESTADO DA APLICAÇÃO
    // ===============================================================
    // Front-End Dev: Armazenar referências aos elementos do DOM para performance.
    const domElements = {
        loadingScreen: document.getElementById('loading-screen'),
        progressBar: document.getElementById('progress-bar'),
        loadingAssetText: document.getElementById('loading-asset-text'),
        globeContainer: document.getElementById('globe-container'),
        timelineContainer: document.getElementById('timeline-container'),
        infoPanel: document.getElementById('info-panel'),
        infoContentWrapper: document.getElementById('info-content-wrapper'),
        closeInfoPanelBtn: document.getElementById('close-info-panel'),
        zoomInBtn: document.getElementById('zoom-in'),
        zoomOutBtn: document.getElementById('zoom-out'),
        resetViewBtn: document.getElementById('reset-view'),
    };

    // Full-Stack Dev: Gerenciar o estado da aplicação.
    const appState = {
        data: null, // Armazenará todo o conteúdo do data.json
        activeTopic: null, // ID do tópico atualmente selecionado
    };

    // ===============================================================
    // 2. INICIALIZAÇÃO DA CENA 3D (CREATIVE TECHNOLOGIST)
    // ===============================================================
    let scene, camera, renderer, controls, earthMesh, cloudsMesh;

    function initThreeJS() {
        // --- Cena e Câmera ---
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.5;

        // --- Renderizador ---
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true // Fundo transparente para ver a cor do body
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Otimiza para telas de alta resolução
        domElements.globeContainer.appendChild(renderer.domElement);

        // --- Luzes ---
        // UX: Uma luz ambiente suave para que o lado escuro do planeta não seja totalmente preto.
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        // Creative Dev: Uma luz direcional para simular o sol, criando sombras e reflexos.
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
        
        // --- Controles de Órbita ---
        // UX: Permite ao usuário interagir com o globo (girar, zoom, arrastar).
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Efeito de "desaceleração" suave
        controls.dampingFactor = 0.05;
        controls.enablePan = false; // Desativa o "arrastar" do globo
        controls.minDistance = 1.2; // Zoom máximo de aproximação
        controls.maxDistance = 5;   // Zoom máximo de afastamento

        // --- Gerenciador de Carregamento (Loading Manager) ---
        // UX: Crucial para monitorar o progresso do carregamento e atualizar a tela de loading.
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = itemsLoaded / itemsTotal;
            domElements.progressBar.style.width = `${progress * 100}%`;
            domElements.loadingAssetText.textContent = `Carregando ${url.split('/').pop()}`;
        };
        loadingManager.onLoad = () => {
            // Atraso sutil para garantir que tudo esteja renderizado antes de remover a tela.
            setTimeout(() => {
                domElements.loadingScreen.classList.add('hidden');
            }, 500);
        };

        const textureLoader = new THREE.TextureLoader(loadingManager);

        // --- Criando o Planeta Terra ---
        // Creative Tech: Usando texturas de alta qualidade para um visual realista.
        // IMPORTANTE: Você precisará fornecer estes arquivos de imagem na pasta 'assets/textures/'
        const earthDayMap = textureLoader.load('assets/textures/earth_daymap.jpg');
        const earthSpecularMap = textureLoader.load('assets/textures/earth_specular_map.jpg');
        const earthNormalMap = textureLoader.load('assets/textures/earth_normal_map.png');
        
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthDayMap,
            metalnessMap: earthSpecularMap, // Cria reflexo na água
            normalMap: earthNormalMap, // Adiciona detalhes de relevo
            metalness: 0.5,
            roughness: 0.7
        });
        earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        // --- Criando as Nuvens ---
        const cloudMap = textureLoader.load('assets/textures/earth_clouds.png');
        const cloudsGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: cloudMap,
            transparent: true,
            opacity: 0.8
        });
        cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        scene.add(cloudsMesh);

        // --- Criando o Fundo Estrelado (Starfield) ---
        const starMap = textureLoader.load('assets/textures/starfield.jpg');
        const starGeometry = new THREE.SphereGeometry(500, 64, 64);
        const starMaterial = new THREE.MeshBasicMaterial({
            map: starMap,
            side: THREE.BackSide // Renderiza a textura no lado de dentro da esfera
        });
        scene.add(new THREE.Mesh(starGeometry, starMaterial));

        // --- Loop de Animação ---
        animate();
    }
    
    // Creative Dev: O loop que renderiza a cena a cada frame.
    function animate() {
        requestAnimationFrame(animate);

        // Animação sutil de rotação para dar vida ao planeta
        earthMesh.rotation.y += 0.0001;
        cloudsMesh.rotation.y += 0.00015; // Nuvens giram um pouco mais rápido

        controls.update(); // Necessário se enableDamping for true
        renderer.render(scene, camera);
    }
    
    // --- Responsividade ---
    // Front-End Dev: Garante que a cena 3D se adapte ao tamanho da janela.
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ===============================================================
    // 3. LÓGICA DA UI E EVENTOS (INTERACTIVE DEVELOPER)
    // ===============================================================
    function initUI() {
        // --- Interação com a Linha do Tempo ---
        // A11y & Performance: Usando delegação de eventos.
        domElements.timelineContainer.addEventListener('click', (e) => {
            const topicElement = e.target.closest('[data-topic-id]');
            if (topicElement) {
                const topicId = topicElement.dataset.topicId;
                displayTopicInfo(topicId);

                // UX: Atualiza o estado visual do item ativo.
                const currentActive = domElements.timelineContainer.querySelector('.active');
                if (currentActive) currentActive.classList.remove('active');
                topicElement.classList.add('active');
            }
        });

        // --- Fechar Painel de Informações ---
        domElements.closeInfoPanelBtn.addEventListener('click', () => {
            domElements.infoPanel.setAttribute('hidden', '');
            appState.activeTopic = null;
            // UX: Remove o item ativo da timeline quando o painel é fechado.
            const currentActive = domElements.timelineContainer.querySelector('.active');
            if (currentActive) currentActive.classList.remove('active');
        });

        // --- Controles do Globo ---
        domElements.zoomInBtn.addEventListener('click', () => controls.dollyIn(1.2));
        domElements.zoomOutBtn.addEventListener('click', () => controls.dollyOut(1.2));
        domElements.resetViewBtn.addEventListener('click', () => controls.reset());
    }

    // ===============================================================
    // 4. MANIPULAÇÃO DE DADOS (FULL-STACK DEV)
    // ===============================================================

    async function loadDataAndPopulateUI() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            appState.data = await response.json();
            populateTimeline();
        } catch (error) {
            console.error("Não foi possível carregar os dados das crônicas:", error);
            domElements.timelineContainer.innerHTML = `<p style="color: red;">Erro ao carregar conteúdo.</p>`;
        }
    }

    function populateTimeline() {
        const { eras } = appState.data;
        let html = '';
        for (const era of eras) {
            html += `
                <div class="era" data-era-id="${era.id}">
                    <h3>${era.name}</h3>
                    <ul class="topics">
                        ${era.topics.map(topic => `
                            <li data-topic-id="${topic.id}">${topic.title}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        domElements.timelineContainer.innerHTML = html;
    }

    function displayTopicInfo(topicId) {
        let topicData = null;
        // Encontra o tópico correto em todas as eras
        for (const era of appState.data.eras) {
            const foundTopic = era.topics.find(t => t.id === topicId);
            if (foundTopic) {
                topicData = foundTopic;
                break;
            }
        }

        if (topicData) {
            appState.activeTopic = topicId;
            const contentHtml = `
                <h2 id="info-title">${topicData.title}</h2>
                <p id="info-date-range" class="date-range">${topicData.dateRange}</p>
                <div id="info-body">
                    ${topicData.content} 
                </div>
            `; // O 'content' virá como HTML do JSON
            domElements.infoContentWrapper.innerHTML = contentHtml;
            domElements.infoPanel.removeAttribute('hidden');
            domElements.infoContentWrapper.scrollTop = 0; // Garante que o painel inicie do topo
        } else {
            console.warn(`Tópico com id "${topicId}" não encontrado.`);
        }
    }

    // ===============================================================
    // 5. INICIALIZAÇÃO GERAL DA APLICAÇÃO
    // ===============================================================
    function initApp() {
        initThreeJS();
        initUI();
        loadDataAndPopulateUI();
    }

    initApp();

});
