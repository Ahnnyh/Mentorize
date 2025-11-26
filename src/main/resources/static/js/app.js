// js/app.js - Versão Corrigida
class MentorizeApp {
    constructor() {
        this.currentView = 'dashboard';
        this.managers = {};
        this.init();
    }

    init() {
        this.initManagers();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initManagers() {
        try {
            this.managers.tarefas = new TarefaManager();
            this.managers.estudos = new EstudoManager();
            this.managers.anotacoes = new AnotacaoManager();
            this.managers.metas = new MetaManager();
        } catch (error) {
            console.error('Erro ao inicializar managers:', error);
        }
    }

    setupEventListeners() {
        // Navegação - com verificação de segurança
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const viewName = e.currentTarget.dataset.view;
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });

        // Botões de adicionar
        this.setupAddButton('addTaskBtn', () => this.openTaskModal());
        this.setupAddButton('addStudyBtn', () => this.openStudyModal());
        this.setupAddButton('addNoteBtn', () => this.openNoteModal());
        this.setupAddButton('addGoalBtn', () => this.openGoalModal());
    }

    setupAddButton(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    }

    switchView(viewName) {
        console.log('Mudando para view:', viewName);
        
        // Verificar se a view existe
        const targetView = document.getElementById(viewName);
        if (!targetView) {
            console.error('View não encontrada:', viewName);
            return;
        }

        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-view="${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Atualizar views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        targetView.classList.add('active');

        this.currentView = viewName;
        this.loadViewData(viewName);
    }

    loadViewData(viewName) {
        console.log('Carregando dados para:', viewName);
        
        switch (viewName) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.loadDashboardData();
                }
                break;
            case 'tasks':
                if (this.managers.tarefas) {
                    this.managers.tarefas.loadTasks();
                }
                break;
            case 'studies':
                if (this.managers.estudos) {
                    this.managers.estudos.load();
                }
                break;
            case 'notes':
                if (this.managers.anotacoes) {
                    this.managers.anotacoes.loadNotes();
                }
                break;
            case 'goals':
                if (this.managers.metas) {
                    this.managers.metas.loadGoals();
                }
                break;
        }
    }

    openTaskModal(task = null) {
        this.openModal('taskModal', 'taskModalTitle', 'Nova Tarefa', 'taskForm');
    }

    openStudyModal() {
        this.openModal('studyModal', 'studyModalTitle', 'Nova Sessão de Estudo', 'studyForm');
    }

    openNoteModal() {
        this.openModal('noteModal', 'noteModalTitle', 'Nova Anotação', 'noteForm');
    }

    openGoalModal() {
        if (this.managers.metas) {
            this.managers.metas.openCreateModal();
        }
    }

    openModal(modalId, titleId, defaultTitle, formId) {
        const modal = document.getElementById(modalId);
        const title = document.getElementById(titleId);
        const form = document.getElementById(formId);
        
        if (modal) {
            if (title) title.textContent = defaultTitle;
            if (form) form.reset();
            modal.classList.add('active');
        }
    }

    loadInitialData() {
        if (typeof Dashboard !== 'undefined') {
            Dashboard.loadDashboardData();
        }
        this.updatePendingTasksCount();
    }

    async updatePendingTasksCount() {
        try {
            const response = await fetch('http://localhost:8080/tarefas');
            if (!response.ok) throw new Error('Erro ao buscar tarefas');
            
            const tasks = await response.json();
            const pendingCount = tasks.filter(task => !task.concluida).length;
            
            const badge = document.getElementById('pendingTasksCount');
            if (badge) {
                badge.textContent = pendingCount;
                badge.style.display = pendingCount > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Erro ao carregar contagem de tarefas:', error);
        }
    }
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new MentorizeApp();
        console.log('MentorizeApp inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar MentorizeApp:', error);
    }
});