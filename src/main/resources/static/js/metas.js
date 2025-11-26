// js/metas.js
class MetaManager {
    constructor() {
        this.goals = [];
        this.isSaving = false;
        this.currentFilter = 'all'; // all, active, completed
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGoals();
    }


    setupEventListeners() {
        console.log('Configurando event listeners para metas...');
        
        // ⭐ CORREÇÃO: Usar event delegation para os filtros
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tab') || e.target.closest('.filter-tab')) {
                const filterElement = e.target.classList.contains('filter-tab') ? e.target : e.target.closest('.filter-tab');
                const filter = filterElement.dataset.filter;
                console.log('Filtro de metas clicado:', filter);
                this.setFilter(filter);
            }
        });
    }

    // ⭐ MODIFIQUE o loadGoals para usar filtro
    async loadGoals() {
        try {
            const response = await fetch("http://localhost:8080/metas");
            if (!response.ok) throw new Error("Erro ao buscar metas");
            this.goals = await response.json();
            this.setFilter(this.currentFilter); // ⭐ MUDANÇA: usar setFilter
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
            Utils.showNotification('Erro ao carregar metas', 'error');
        }
    }

    renderGoals() {
        const container = document.getElementById('goalsList');
        if (!container) return;

        if (this.goals.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const activeGoals = this.goals.filter(goal => (goal.progresso || 0) < 100);
        const completedGoals = this.goals.filter(goal => (goal.progresso || 0) >= 100);

        container.innerHTML = `
            ${activeGoals.length > 0 ? `
                <div class="goals-section">
                    <h3 class="section-title">
                        <i class="fas fa-spinner"></i>
                        Metas em Andamento
                        <span class="section-count">${activeGoals.length}</span>
                    </h3>
                    <div class="goals-grid">
                        ${activeGoals.map(goal => this.createGoalCard(goal)).join('')}
                    </div>
                </div>
            ` : ''}

            ${completedGoals.length > 0 ? `
                <div class="goals-section">
                    <h3 class="section-title">
                        <i class="fas fa-check-circle"></i>
                        Metas Concluídas
                        <span class="section-count">${completedGoals.length}</span>
                    </h3>
                    <div class="goals-grid">
                        ${completedGoals.map(goal => this.createGoalCard(goal)).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        this.attachGoalEventListeners();
    }

    createGoalCard(goal) {
        const progress = goal.progresso || 0;
        const isCompleted = progress >= 100;
        const progressClass =
            isCompleted ? 'completed' :
            progress > 75 ? 'almost' :
            progress > 50 ? 'halfway' : 'started';

        return `
            <div class="goal-card ${progressClass}" data-goal-id="${goal.id}">
                <div class="goal-card-header">
                    <h4 class="goal-title">${Utils.escapeHtml(goal.nome)}</h4>
                    <div class="goal-actions">
                        <button class="btn-icon edit-goal" data-goal-id="${goal.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-goal" data-goal-id="${goal.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-info">
                        <span class="progress-text">${progress}% concluído</span>
                        <span class="progress-percentage">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                ${goal.descricao ? `
                    <div class="goal-description">
                        <p>${Utils.escapeHtml(goal.descricao)}</p>
                    </div>
                ` : ''}

                <div class="goal-footer">
                    <div class="goal-meta">
                        ${goal.dataLimite ? `
                            <span class="goal-deadline">
                                <i class="fas fa-calendar"></i>
                                ${Utils.formatDate(goal.dataLimite)}
                            </span>
                        ` : ''}
                        ${goal.tipo ? `
                            <span class="goal-type">
                                <i class="fas fa-tag"></i>
                                ${goal.tipo}
                            </span>
                        ` : ''}
                    </div>
                    ${!isCompleted ? `
                        <div class="goal-controls">
                            <button class="btn-sm btn-outline decrease-progress" data-goal-id="${goal.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="btn-sm btn-primary increase-progress" data-goal-id="${goal.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    ` : `
                        <div class="goal-completed">
                            <i class="fas fa-check"></i>
                            Concluída
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <h4>Nenhuma meta definida</h4>
                <p>Comece criando sua primeira meta!</p>
            </div>
        `;
    }

    attachGoalEventListeners() {
        document.querySelectorAll('.edit-goal').forEach(btn => 
            btn.addEventListener('click', (e) => this.editGoal(e.currentTarget.dataset.goalId))
        );
        document.querySelectorAll('.delete-goal').forEach(btn => 
            btn.addEventListener('click', (e) => this.deleteGoal(e.currentTarget.dataset.goalId))
        );
        document.querySelectorAll('.increase-progress').forEach(btn => 
            btn.addEventListener('click', (e) => this.updateProgress(e.currentTarget.dataset.goalId, 10))
        );
        document.querySelectorAll('.decrease-progress').forEach(btn => 
            btn.addEventListener('click', (e) => this.updateProgress(e.currentTarget.dataset.goalId, -10))
        );
    }

    async updateProgress(goalId, change) {
        const goal = this.goals.find(g => g.id == goalId);
        if (!goal) return;
        
        let newProgress = Math.min(100, Math.max(0, (goal.progresso || 0) + change));
        
        try {
            const res = await fetch(`http://localhost:8080/metas/${goalId}/progresso?progresso=${newProgress}`, { 
                method: 'PATCH' 
            });
            
            if (!res.ok) throw new Error('Erro ao atualizar progresso');
            
            goal.progresso = newProgress;
            this.renderGoals();
            
            if (newProgress === 100) {
                Utils.showNotification('Meta concluída! 🎉', 'success');
            } else {
                Utils.showNotification('Progresso atualizado!', 'success');
            }
            
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
            Utils.showNotification('Erro ao atualizar progresso', 'error');
        }
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id == goalId);
        if (!goal) return;
        this.openEditModal(goal);
    }

    openCreateModal() {
        this.openEditModal({});
    }

    openEditModal(goal) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${goal.id ? 'Editar Meta' : 'Criar Nova Meta'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="modal-body" id="goalFormModal">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" id="goalName" value="${Utils.escapeHtml(goal.nome || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea id="goalDescription" rows="3">${Utils.escapeHtml(goal.descricao || '')}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Progresso (%)</label>
                            <input type="number" id="goalProgress" min="0" max="100" value="${goal.progresso || 0}">
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="goalType">
                                <option value="academica" ${goal.tipo==='academica'?'selected':''}>Acadêmica</option>
                                <option value="pessoal" ${goal.tipo==='pessoal'?'selected':''}>Pessoal</option>
                                <option value="profissional" ${goal.tipo==='profissional'?'selected':''}>Profissional</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Prazo</label>
                        <input type="date" id="goalDeadline" value="${goal.dataLimite ? Utils.formatDateForInput(goal.dataLimite) : ''}">
                    </div>
                </form>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelGoal">Cancelar</button>
                    <button type="submit" form="goalFormModal" class="btn-primary">Salvar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelGoal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) modal.remove(); 
        });

        modal.querySelector('#goalFormModal').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (goal.id) {
                await this.updateGoal(goal.id);
            } else {
                await this.createGoal();
            }
            modal.remove();
        });
    }

    async createGoal() {
        const formData = {
            nome: document.getElementById('goalName').value.trim(),
            descricao: document.getElementById('goalDescription').value.trim(),
            progresso: parseInt(document.getElementById('goalProgress').value) || 0,
            tipo: document.getElementById('goalType').value,
            dataLimite: document.getElementById('goalDeadline').value ? 
                `${document.getElementById('goalDeadline').value} 00:00:00` : null
        };

        if (!formData.nome) {
            Utils.showNotification('Nome da meta é obrigatório', 'error');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/metas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Erro ao criar meta');

            await this.loadGoals();
            Utils.showNotification('Meta criada com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao criar meta:', error);
            Utils.showNotification('Erro ao criar meta', 'error');
        }
    }

    async updateGoal(goalId) {
        const formData = {
            nome: document.getElementById('goalName').value.trim(),
            descricao: document.getElementById('goalDescription').value.trim(),
            progresso: parseInt(document.getElementById('goalProgress').value) || 0,
            tipo: document.getElementById('goalType').value,
            dataLimite: document.getElementById('goalDeadline').value ? 
                `${document.getElementById('goalDeadline').value} 00:00:00` : null
        };

        if (!formData.nome) {
            Utils.showNotification('Nome da meta é obrigatório', 'error');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/metas/${goalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Erro ao atualizar meta');

            await this.loadGoals();
            Utils.showNotification('Meta atualizada com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao atualizar meta:', error);
            Utils.showNotification('Erro ao atualizar meta', 'error');
        }
    }

    async deleteGoal(goalId) {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
        
        try {
            const res = await fetch(`http://localhost:8080/metas/${goalId}`, { 
                method: 'DELETE' 
            });
            
            if (!res.ok) throw new Error('Erro ao excluir meta');
            
            await this.loadGoals();
            Utils.showNotification('Meta excluída com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao excluir meta:', error);
            Utils.showNotification('Erro ao excluir meta', 'error');
        }
    }

    // ⭐ CORREÇÃO: Método setFilter completo
    setFilter(filter) {
        console.log('Aplicando filtro de metas:', filter);
        this.currentFilter = filter;
        
        // Atualizar estado visual das abas
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`.goal-filters [data-filter="${filter}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Aplicar filtro
        let filteredGoals = [];
        
        switch (filter) {
            case 'all':
                filteredGoals = this.goals;
                break;
            case 'active':
                filteredGoals = this.goals.filter(goal => (goal.progresso || 0) < 100);
                break;
            case 'completed':
                filteredGoals = this.goals.filter(goal => (goal.progresso || 0) >= 100);
                break;
            default:
                filteredGoals = this.goals;
        }
        
        console.log('Metas filtradas:', filteredGoals.length);
        this.renderFilteredGoals(filteredGoals);
    }

        // ⭐ NOVO: Método para renderizar metas filtradas
    renderFilteredGoals(filteredGoals) {
        const container = document.getElementById('goalsList');
        if (!container) return;

        if (filteredGoals.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const activeGoals = filteredGoals.filter(goal => (goal.progresso || 0) < 100);
        const completedGoals = filteredGoals.filter(goal => (goal.progresso || 0) >= 100);

        container.innerHTML = `
            ${activeGoals.length > 0 ? `
                <div class="goals-section">
                    <h3 class="section-title">
                        <i class="fas fa-spinner"></i>
                        Metas em Andamento
                        <span class="section-count">${activeGoals.length}</span>
                    </h3>
                    <div class="goals-grid">
                        ${activeGoals.map(goal => this.createGoalCard(goal)).join('')}
                    </div>
                </div>
            ` : ''}

            ${completedGoals.length > 0 ? `
                <div class="goals-section">
                    <h3 class="section-title">
                        <i class="fas fa-check-circle"></i>
                        Metas Concluídas
                        <span class="section-count">${completedGoals.length}</span>
                    </h3>
                    <div class="goals-grid">
                        ${completedGoals.map(goal => this.createGoalCard(goal)).join('')}
                    </div>
                </div>
            ` : ''}

            ${filteredGoals.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h4>Nenhuma meta encontrada</h4>
                    <p>Nenhuma meta corresponde ao filtro selecionado.</p>
                </div>
            ` : ''}
        `;

        this.attachGoalEventListeners();
    }

}

// Inicialização global
let metaManager;
document.addEventListener('DOMContentLoaded', () => {
    metaManager = new MetaManager();
});