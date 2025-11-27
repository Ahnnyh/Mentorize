// js/dashboard.js - VERSÃO GLASSMORPHISM
class Dashboard {
    static async loadDashboardData() {
        try {
            // Mostrar estado de loading
            this.showLoadingState();
            
            const [tasks, studies, goals, notes] = await Promise.all([
                this.fetchTasks(),
                this.fetchStudies(),
                this.fetchGoals(),
                this.fetchNotes()
            ]);

            this.updateStats(tasks, studies, goals);
            this.updateFeaturedGoals(goals);
            
            // Remover loading
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            this.showErrorState();
        }
    }

    static showLoadingState() {
        const statsElements = ['totalTasks', 'goalsCompleted', 'productivityScore'];
        statsElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '--';
            }
        });

        const featuredContainer = document.getElementById('featuredGoalsGrid');
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="empty-state-glass">
                    <div class="empty-icon-glass">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <h3>Carregando metas...</h3>
                </div>
            `;
        }
    }

    static hideLoadingState() {
        // Loading será removido quando o conteúdo for carregado
    }

    static showErrorState() {
        const featuredContainer = document.getElementById('featuredGoalsGrid');
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="empty-state-glass">
                    <div class="empty-icon-glass">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erro ao carregar</h3>
                    <p>Tente recarregar a página</p>
                    <button class="btn-create-glass" onclick="Dashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i>
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    static async fetchTasks() {
        try {
            const response = await fetch('http://localhost:8080/tarefas');
            if (!response.ok) throw new Error('Erro ao buscar tarefas');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }

    static async fetchStudies() {
        try {
            const response = await fetch('http://localhost:8080/estudos');
            if (!response.ok) throw new Error('Erro ao buscar estudos');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar estudos:', error);
            return [];
        }
    }

    static async fetchGoals() {
        try {
            const response = await fetch('http://localhost:8080/metas');
            if (!response.ok) throw new Error('Erro ao buscar metas');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
            return [];
        }
    }

    static async fetchNotes() {
        try {
            const response = await fetch('http://localhost:8080/anotacoes');
            if (!response.ok) throw new Error('Erro ao buscar anotações');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar anotações:', error);
            return [];
        }
    }

static updateStats(tasks, studies, goals) {
    // Total de tarefas pendentes
    const pendingTasks = tasks.filter(task => !task.concluida).length;
    this.updateStatElement('totalTasks', pendingTasks);
    
    // Metas concluídas
    const completedGoals = goals.filter(goal => (goal.progresso || 0) >= 100).length;
    this.updateStatElement('goalsCompleted', completedGoals);

    // ⭐⭐ CORREÇÃO: Score de produtividade em porcentagem
    const totalStudies = studies.length;
    const completedStudies = studies.filter(study => study.concluido).length;
    const totalItems = totalStudies + goals.length;
    const completedItems = completedStudies + completedGoals;
    
    let productivity = 0;
    if (totalItems > 0) {
        productivity = Math.min(100, Math.round((completedItems / totalItems) * 100));
    }
    
    // ⭐⭐ CORREÇÃO: Garantir que mostre com símbolo de porcentagem
    const productivityElement = document.getElementById('productivityScore');
    if (productivityElement) {
        productivityElement.textContent = `${productivity}%`;
    }

    // Atualizar tendências
    this.updateTrends(tasks, studies, goals);
}

    static updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Verificar se é um número para animação
            const numericValue = parseInt(value);
            if (!isNaN(numericValue)) {
                this.animateValue(element, 0, numericValue, 1000);
            } else {
                element.textContent = value;
            }
        }
    }

    static animateValue(element, start, end, duration) {
        const startValue = parseInt(start) || 0;
        const endValue = parseInt(end) || 0;
        const range = endValue - startValue;
        
        // Se não há mudança, apenas definir o valor
        if (range === 0) {
            element.textContent = endValue;
            return;
        }
        
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para animação suave
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (range * easeOutQuart);
            
            element.textContent = Math.round(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = endValue;
            }
        }
        
        requestAnimationFrame(update);
    }

    static updateTrends(tasks, studies, goals) {
        // Calcular tendências baseadas em dados históricos
        const pendingTasks = tasks.filter(task => !task.concluida).length;
        const completedGoals = goals.filter(goal => (goal.progresso || 0) >= 100).length;
        
        // Simular tendências (em produção, você teria dados históricos)
        const trends = {
            tasks: pendingTasks > 5 ? 'down' : 'up',
            goals: completedGoals > 0 ? 'up' : 'stable',
            productivity: 'up'
        };
        
        this.updateTrendElements(trends);
    }

    static updateTrendElements(trends) {
        // Atualizar elementos de tendência no DOM
        const trendElements = document.querySelectorAll('.stat-trend-glass');
        trendElements.forEach(element => {
            const cardType = element.closest('.glass-card').querySelector('.stat-icon-glass').className.includes('tasks') ? 'tasks' : 
                           element.closest('.glass-card').querySelector('.stat-icon-glass').className.includes('goals') ? 'goals' : 'productivity';
            
            const trend = trends[cardType];
            this.updateTrendElement(element, trend);
        });
    }

    static updateTrendElement(element, trend) {
        if (trend === 'up') {
            element.innerHTML = '<i class="fas fa-arrow-up"></i><span>Em alta</span>';
            element.className = 'stat-trend-glass trend-up';
        } else if (trend === 'down') {
            element.innerHTML = '<i class="fas fa-arrow-down"></i><span>Em baixa</span>';
            element.className = 'stat-trend-glass trend-down';
        } else {
            element.innerHTML = '<i class="fas fa-minus"></i><span>Estável</span>';
            element.className = 'stat-trend-glass';
        }
    }

    static updateFeaturedGoals(goals) {
        const featuredGoalsContainer = document.getElementById('featuredGoalsGrid');
        if (!featuredGoalsContainer) return;

        console.log('Metas recebidas para destaque:', goals);

        // Ordenar metas: não concluídas primeiro, depois por progresso decrescente
        const sortedGoals = goals
            .filter(goal => (goal.progresso || 0) < 100) // Apenas metas não concluídas
            .sort((a, b) => (b.progresso || 0) - (a.progresso || 0))
            .slice(0, 3); // Pegar apenas as 3 principais

        console.log('Metas filtradas para destaque:', sortedGoals);

        if (sortedGoals.length === 0) {
            featuredGoalsContainer.innerHTML = `
                <div class="empty-goals-state-elegant">
                    <div class="empty-icon-elegant">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <h3>Nenhuma Meta em Andamento</h3>
                    <p>Comece criando sua primeira meta!</p>
                    <button class="btn-create-goal-elegant" onclick="app.openGoalModal()">
                        <i class="fas fa-plus"></i>
                        Criar Primeira Meta
                    </button>
                </div>
            `;
            return;
        }

        featuredGoalsContainer.innerHTML = sortedGoals.map((goal, index) => {
            const progress = goal.progresso || 0;
            const deadline = goal.dataLimite ? new Date(goal.dataLimite) : null;
            const now = new Date();
            
            // ⭐ CORREÇÃO: Usar goal.nome em vez de goal.titulo
            const goalTitle = goal.nome || goal.titulo || 'Meta sem título';
            const goalDescription = goal.descricao || '';
            
            // Calcular dias restantes
            let badgeContent = '';
            if (deadline) {
                const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                if (daysLeft > 0) {
                    badgeContent = `
                        <div class="goal-badge-elegant">
                            <i class="fas fa-clock"></i>
                            <span>${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} restantes</span>
                        </div>
                    `;
                } else if (daysLeft === 0) {
                    badgeContent = `
                        <div class="goal-badge-elegant urgent">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Vence hoje!</span>
                        </div>
                    `;
                } else {
                    badgeContent = `
                        <div class="goal-badge-elegant overdue">
                            <i class="fas fa-calendar-times"></i>
                            <span>Atrasada ${Math.abs(daysLeft)} dias</span>
                        </div>
                    `;
                }
            }

            // Determinar classe de prioridade
            let priorityClass = '';
            let priorityBadge = '';
            if (goal.prioridade === 'ALTA') {
                priorityClass = 'high-priority';
                priorityBadge = '<span class="goal-priority priority-alta">Alta</span>';
            } else if (goal.prioridade === 'MEDIA') {
                priorityClass = 'medium-priority';
                priorityBadge = '<span class="goal-priority priority-media">Média</span>';
            } else if (goal.prioridade === 'BAIXA') {
                priorityBadge = '<span class="goal-priority priority-baixa">Baixa</span>';
            }

            return `
                <div class="goal-card-elegant ${priorityClass}" style="animation-delay: ${index * 0.15}s">
                    <div class="goal-header-elegant">
                        <div class="goal-title-container">
                            <h3 class="goal-title-elegant">
                                ${Utils.escapeHtml(goalTitle)}
                                ${priorityBadge}
                            </h3>
                        </div>
                        <div class="goal-progress-elegant">${progress}%</div>
                    </div>
                    
                    ${goalDescription ? `
                        <p class="goal-description-elegant">${Utils.escapeHtml(goalDescription)}</p>
                    ` : ''}
                    
                    <div class="progress-container-elegant">
                        <div class="progress-bar-elegant">
                            <div class="progress-fill-elegant" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text-elegant">${progress}%</span>
                    </div>
                    
                    <div class="goal-meta-info">
                        ${badgeContent}
                        
                        ${goal.tipo ? `
                            <div class="goal-badge-elegant">
                                <i class="fas fa-tag"></i>
                                ${Utils.escapeHtml(goal.tipo)}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- REMOVIDOS: Os botões de ação que estavam aqui -->
                </div>
            `;
        }).join('');
    }

    static async updateGoalProgress(goalId, newProgress) {
        try {
            const response = await fetch(`http://localhost:8080/metas/${goalId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    progresso: Math.min(100, newProgress)
                })
            });

            if (response.ok) {
                // Recarregar os dados do dashboard
                this.loadDashboardData();
                
                // Mostrar notificação de sucesso
                this.showNotification('Progresso da meta atualizado!', 'success');
            }
        } catch (error) {
            console.error('Erro ao atualizar progresso da meta:', error);
            this.showNotification('Erro ao atualizar progresso', 'error');
        }
    }

    static editGoal(goalId) {
        // Abrir modal de edição usando o manager de metas
        if (window.app && window.app.managers && window.app.managers.metas) {
            window.app.managers.metas.openEditModal(goalId);
        } else {
            console.log('Editar meta:', goalId);
            this.showNotification('Funcionalidade de edição em desenvolvimento 🛠️', 'info');
        }
    }

    static viewGoalDetails(goalId) {
        // Navegar para a view de metas com foco na meta específica
        if (window.app) {
            window.app.switchView('goals');
            // Aqui você pode adicionar lógica para destacar a meta específica
        }
    }

    static showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `glass-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            this.addNotificationStyles();
        }
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    static getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            info: 'info-circle',
            warning: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    static addNotificationStyles() {
        const styles = `
            .glass-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: var(--gradient-glass);
                backdrop-filter: var(--glass-blur);
                border: var(--glass-border);
                border-radius: 16px;
                padding: 1rem 1.5rem;
                box-shadow: var(--glass-shadow);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 350px;
            }
            
            .glass-notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .glass-notification.success {
                border-left: 4px solid #10b981;
            }
            
            .glass-notification.error {
                border-left: 4px solid #ef4444;
            }
            
            .glass-notification.info {
                border-left: 4px solid var(--purple);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: var(--text-primary);
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .glass-notification.success .notification-content i {
                color: #10b981;
            }
            
            .glass-notification.error .notification-content i {
                color: #ef4444;
            }
            
            .glass-notification.info .notification-content i {
                color: var(--purple);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Método para atualizar o dashboard em tempo real
    static refresh() {
        this.loadDashboardData();
    }

    // Inicializar auto-refresh a cada 30 segundos
    static initAutoRefresh() {
        setInterval(() => {
            this.loadDashboardData();
        }, 30000); // 30 segundos
    }
}

// Inicializar auto-refresh quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.initAutoRefresh();
});