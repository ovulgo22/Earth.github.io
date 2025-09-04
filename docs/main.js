/* =================================================================== */
/* A CRÔNICA DA HUMANIDADE - SCRIPT PRINCIPAL (main.js) V4.0           */
/* =================================================================== */
/* Equipe: Creative Tech, Full-Stack, Interactive Dev, UX, A11y        */
/* =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================================================
    // 1. SELEÇÃO DE ELEMENTOS DO DOM E ESTADO DA APLICAÇÃO V4.0
    // ===============================================================
    const domElements = {
        // ... (elementos da V3.0) ...
        introScreen: document.getElementById('intro-screen'),
        enterButton: document.getElementById('enter-button'),
        mainExperience: document.getElementById('main-experience'),
        globeContainer: document.getElementById('globe-container'),
        infoPanel: document.getElementById('info-panel'),
        infoContentWrapper: document.getElementById('info-content-wrapper'),
        closeInfoPanelBtn: document.getElementById('close-info-panel'),
        eraSelectorContainer: document.getElementById('era-selector-container'),
        topicsScrollerContainer: document.getElementById('topics-scroller-container'),
        // V4.0: UI do Modo História
        storyModeUI: document.getElementById('story-mode-ui'),
        storyModeTitle: document.getElementById('story-mode-title'),
        storyModeStep: document.getElementById('story-mode-step'),
        storyPrevBtn: document.getElementById('story-prev-btn'),
        storyNextBtn: document.getElementById('story-next-btn'),
        storyCloseBtn: document.getElementById('story-close-btn'),
        storyModeBtn: document.getElementById('story-mode-btn'),
        // V4.0: Controles e Áudio
        togglePoiCheckbox: document.getElementById('toggle-poi'),
        toggleConnectionsCheckbox: document.getElementById('toggle-connections'),
        toggleDayNightBtn: document.getElementById('toggle-day-night'),
        ambientSound: document.getElementById('ambient-sound'),
        uiClickSound: document.getElementById('ui-click-sound'),
        uiSwooshSound: document.getElementById('ui-swoosh-sound'),
        soundVolumeInput: document.getElementById('sound-volume'),
    };

    const appState = {
        data: null,
        activeTopicId: null,
        activeEraId: null,
        experienceStarted: false,
        soundVolume: parseFloat(domElements.soundVolumeInput.value),
        poiVisible: domElements.togglePoiCheckbox.checked,
        connectionsVisible: domElements.toggleConnectionsCheckbox.checked,
        globeMode: 'day', // 'day' ou 'night'
        storyMode: {
            active: false,
            playlist: [],
            currentStep: 0,
            title: ''
        }
    };

    // ===============================================================
    // 2. INICIALIZAÇÃO DA CENA 3D V4.0 (CREATIVE TECHNOLOGIST)
    // ===============================================================
    let scene, camera, renderer, controls, sunLight, earthMesh, cloudsMesh, atmosphereMesh, poiGroup, connectionsGroup;
    let earthDayMap, earthNightMap, earthNormalMap, earthSpecularMap;

    // --- V4.0: CÓDIGO DOS SHADERS PARA ATMOSFERA (GLSL) ---
    const vertexShader = `
        varying vec3 vertexNormal;
        void main() {
            vertexNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const fragmentShader = `
        varying vec3 vertexNormal;
        void main() {
            float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
    `;

    function initThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        domElements.globeContainer.appendChild(renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        sunLight = new THREE.DirectionalLight(0xffffff, 1.5); // Luz solar mais forte
        sunLight.position.set(5, 3, 5);
        scene.add(sunLight);
        
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enabled = false;
        
        const textureLoader = new THREE.TextureLoader();
        // V4.0: Carrega a nova textura de luzes da cidade
        earthDayMap = textureLoader.load('assets/textures/earth_daymap.jpg');
        earthNightMap = textureLoader.load('assets/textures/earth_nightmap.jpg');
        earthNormalMap = textureLoader.load('assets/textures/earth_normal_map.png');
        earthSpecularMap = textureLoader.load('assets/textures/earth_specular_map.jpg');
        
        earthMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 64, 64),
            new THREE.MeshStandardMaterial({
                map: earthDayMap,
                normalMap: earthNormalMap,
                metalnessMap: earthSpecularMap,
                metalness: 0.4,
                roughness: 0.7,
                // V4.0: Propriedades para as luzes da cidade
                emissiveMap: earthNightMap,
                emissive: 0xffffff,
                emissiveIntensity: 0 // Começa desligada
            })
        );
        scene.add(earthMesh);
        
        // V4.0: Mesh da Atmosfera com shaders customizados
        atmosphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.04, 64, 64),
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            })
        );
        scene.add(atmosphereMesh);

        // ... (outros meshes como nuvens, grupos de POIs e conexões) ...
        cloudsMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.02, 64, 64),
            new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/textures/earth_clouds.png'), transparent: true, opacity: 0.8 })
        );
        scene.add(cloudsMesh);
        
        poiGroup = new THREE.Group();
        scene.add(poiGroup);
        connectionsGroup = new THREE.Group();
        scene.add(connectionsGroup);

        animate();
    }
    
    function animate() {
        requestAnimationFrame(animate);
        earthMesh.rotation.y += 0.0001;
        cloudsMesh.rotation.y += 0.00015;
        if(controls.enabled) controls.update();
        renderer.render(scene, camera);
    }
    
    // ... (listener de resize) ...

    // ===============================================================
    // 3. LÓGICA DA UI E EVENTOS V4.0 (INTERACTIVE DEVELOPER)
    // ===============================================================
    function initUI() {
        domElements.enterButton.addEventListener('click', startExperience);
        // ... (listeners da timeline e painéis da V3.0) ...
        domElements.eraSelectorContainer.addEventListener('click', handleEraSelection);
        domElements.topicsScrollerContainer.addEventListener('click', handleTopicSelection);
        domElements.closeInfoPanelBtn.addEventListener('click', hideInfoPanel);
        
        // --- V4.0: Novos Listeners ---
        domElements.toggleDayNightBtn.addEventListener('click', toggleGlobeMode);
        domElements.toggleConnectionsCheckbox.addEventListener('change', (e) => {
            connectionsGroup.visible = e.target.checked;
        });
        domElements.storyModeBtn.addEventListener('click', startStoryMode);
        domElements.storyCloseBtn.addEventListener('click', endStoryMode);
        domElements.storyNextBtn.addEventListener('click', () => navigateStory(1));
        domElements.storyPrevBtn.addEventListener('click', () => navigateStory(-1));
    }
    
    // ... (Funções da UI da V3.0 como startExperience, handleEraSelection, etc., são mantidas) ...

    // ===============================================================
    // 4. MODO HISTÓRIA V4.0 (NARRATIVE DESIGNER & DEV)
    // ===============================================================
    function startStoryMode() {
        // Exemplo de uma história. Isso poderia ser carregado do JSON.
        const story = {
            title: "A Ascensão da Ciência",
            playlist: ['copernican_heliocentrism', 'newton_principia', 'sputnik_1', 'james_webb_telescope']
        };

        appState.storyMode = {
            active: true,
            playlist: story.playlist,
            currentStep: 0,
            title: story.title
        };

        domElements.storyModeUI.classList.remove('hidden');
        domElements.timelineBar.style.pointerEvents = 'none'; // Desativa a timeline
        gsap.to(domElements.timelineBar, { opacity: 0.3, duration: 0.5 });
        
        playStoryStep(0);
    }

    function endStoryMode() {
        appState.storyMode.active = false;
        domElements.storyModeUI.classList.add('hidden');
        domElements.timelineBar.style.pointerEvents = 'auto'; // Reativa a timeline
        gsap.to(domElements.timelineBar, { opacity: 1, duration: 0.5 });
    }

    function navigateStory(direction) {
        const newStep = appState.storyMode.currentStep + direction;
        if (newStep >= 0 && newStep < appState.storyMode.playlist.length) {
            playStoryStep(newStep);
        }
    }

    function playStoryStep(stepIndex) {
        appState.storyMode.currentStep = stepIndex;
        const topicId = appState.storyMode.playlist[stepIndex];
        
        displayTopicInfo(topicId);
        const topicData = findTopicById(topicId);
        if (topicData && topicData.coordinates) {
            animateGlobeToCoordinates(topicData.coordinates.lat, topicData.coordinates.lon);
        }
        
        // Sincroniza o card na timeline
        const activeCard = domElements.topicsScrollerContainer.querySelector('.active');
        if(activeCard) activeCard.classList.remove('active');
        const targetCard = domElements.topicsScrollerContainer.querySelector(`[data-topic-id="${topicId}"]`);
        if(targetCard) targetCard.classList.add('active');

        updateStoryUI();
    }
    
    function updateStoryUI() {
        domElements.storyModeTitle.textContent = appState.storyMode.title;
        domElements.storyModeStep.textContent = `Etapa ${appState.storyMode.currentStep + 1} de ${appState.storyMode.playlist.length}`;

        domElements.storyPrevBtn.disabled = appState.storyMode.currentStep === 0;
        domElements.storyNextBtn.disabled = appState.storyMode.currentStep === appState.storyMode.playlist.length - 1;
    }


    // ===============================================================
    // 5. VISUALIZAÇÃO DE DADOS E EFEITOS V4.0 (CREATIVE TECH)
    // ===============================================================

    function toggleGlobeMode() {
        appState.globeMode = appState.globeMode === 'day' ? 'night' : 'day';
        if (appState.globeMode === 'night') {
            // Modo Noite
            gsap.to(sunLight, { intensity: 0.1, duration: 2 });
            gsap.to(earthMesh.material, { emissiveIntensity: 1.0, duration: 2 });
            domElements.toggleDayNightBtn.textContent = "Alternar Dia";
        } else {
            // Modo Dia
            gsap.to(sunLight, { intensity: 1.5, duration: 2 });
            gsap.to(earthMesh.material, { emissiveIntensity: 0, duration: 2 });
            domElements.toggleDayNightBtn.textContent = "Alternar Noite";
        }
    }

    // Função para desenhar conexões (arcos)
    function drawConnections() {
        if (!appState.data.connections) return;
        
        const material = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5 });
        
        appState.data.connections.forEach(conn => {
            const startTopic = findTopicById(conn.from_topic_id);
            const endTopic = findTopicById(conn.to_topic_id);

            if (startTopic && endTopic) {
                const startVec = getVectorFromLatLon(startTopic.coordinates.lat, startTopic.coordinates.lon);
                const endVec = getVectorFromLatLon(endTopic.coordinates.lat, endTopic.coordinates.lon);

                const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
                const altitude = startVec.distanceTo(endVec) * 0.4;
                midPoint.setLength(1 + altitude);

                const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
                const points = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
                const line = new THREE.Line(geometry, material);
                connectionsGroup.add(line);
            }
        });
        connectionsGroup.visible = appState.connectionsVisible;
    }
    
    // Helper para converter lat/lon em um vetor 3D
    function getVectorFromLatLon(lat, lon, radius = 1.01) { // Levemente acima da superfície
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            (radius * Math.cos(phi)),
            (radius * Math.sin(phi) * Math.sin(theta))
        );
    }
    
    // ... (loadDataAndInit agora chama drawConnections) ...
    async function loadDataAndInit() {
        try {
            // ... (carrega dados como na V3.0) ...
            const response = await fetch('data.json');
            appState.data = await response.json();
            
            appState.activeEraId = appState.data.eras[0].id;

            populateEraSelector();
            populateTopicsScroller(appState.activeEraId);
            createPOIMarkers();
            drawConnections(); // <-- NOVO AQUI
        } catch (error) {
            console.error("Não foi possível carregar os dados das crônicas:", error);
        }
    }
    
    // ... (outras funções como createPOIMarkers, findTopicById, animateGlobeToCoordinates, etc., são mantidas) ...

    // ===============================================================
    // 6. INICIALIZAÇÃO GERAL DA APLICAÇÃO
    // ===============================================================
    function initApp() {
        initThreeJS();
        initUI();
        loadDataAndInit();
    }

    initApp();
});
