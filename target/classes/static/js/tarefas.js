// js/tarefas.js
class TarefaManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.isSaving = false; // ⭐ NOVA FLAG para prevenir duplicação
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTasks();
    }

    // NO tarefas.js - versão com proteção contra duplicação
    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // FORMULÁRIO - com proteção contra duplicação
        const taskForm = document.getElementById('taskForm');
        if (taskForm && !taskForm._hasListener) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submit do tarefas.js');
                const editingId = taskForm.dataset.editingId;
                if (editingId) {
                    this.updateTask(editingId);
                } else {
                    this.saveTask();
                }
            });
            taskForm._hasListener = true; // Marcar para evitar duplicação
        }

        // Filtros
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    async loadTasks() {
        try {
            const res = await fetch('http://localhost:8080/tarefas');
            if (!res.ok) throw new Error('Falha ao carregar tarefas');
            this.tasks = await res.json();
            this.renderTasks();
        } catch (err) {
            console.error('Erro ao carregar tarefas:', err);
            Utils.showNotification('Erro ao carregar tarefas', 'error');
        }
    }

    renderTasks() {
        const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
        this.setFilter(activeFilter);

        const container = document.getElementById('tasksList');
        if (!container) return;
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h4>Nenhuma tarefa</h4>
                    <p>Adicione sua primeira tarefa para começar!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.tasks.map(task => this.createTaskCard(task)).join('');
        this.attachTaskListeners();

    }

    createTaskCard(task) {
        const isCompleted = task.concluida ? 'completed' : '';
        const deadline = task.prazo ? Utils.formatDate(task.prazo) : '';
        const priorityClass = task.prioridade ? `priority-${task.prioridade.toLowerCase()}` : '';
        
        return `
            <div class="task-card ${isCompleted}" data-task-id="${task.id}">
                <div class="task-card-header">
                    <div class="task-checkbox">
                        <input type="checkbox" ${task.concluida ? 'checked' : ''} data-task-id="${task.id}">
                        <span class="checkmark"></span>
                    </div>
                    <div class="task-info">
                        <h4 class="task-title">${Utils.escapeHtml(task.titulo)}</h4>
                        ${task.descricao ? `<p class="task-description">${Utils.escapeHtml(task.descricao)}</p>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon edit-task" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-task" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-card-footer">
                    <div class="task-meta">
                        ${deadline ? `
                            <span class="task-deadline">
                                <i class="fas fa-calendar"></i>
                                ${deadline}
                            </span>
                        ` : ''}
                        ${task.prioridade ? `
                            <span class="task-priority ${priorityClass}">
                                ${task.prioridade}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    attachTaskListeners() {
        // Checkboxes
        document.querySelectorAll('.task-card input[type="checkbox"]').forEach(ch => {
            ch.addEventListener('change', (e) => {
                const id = e.target.dataset.taskId;
                const completed = e.target.checked;
                this.toggleTaskCompletion(id, completed);
            });
        });

        // Botões de editar
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.taskId;
                this.openEditModal(id);
            });
        });

        // Botões de excluir
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.taskId;
                this.deleteTask(id);
            });
        });

        // Clique no card para visualizar
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.task-actions') || e.target.closest('input[type="checkbox"]')) return;
                const id = card.dataset.taskId;
                this.viewTask(id);
            });
        });
    }

    async saveTask() {
       if (this.isSaving) {
            console.log('⚠️ Save já em andamento, ignorando chamada duplicada');
            return;
        }
        
        this.isSaving = true;
        console.log('=== SAVE TASK (BLOQUEADO DUPLICAÇÃO) ===');
        
        // Encontrar o botão de forma segura
        const submitBtn = document.querySelector('#taskForm button[type="submit"]');
        if (!submitBtn) {
            console.error('Botão de submit não encontrado!');
            // Continuar mesmo sem o botão
        } else {
            // Prevenir múltiplos envios apenas se o botão existir
            if (submitBtn.disabled) {
                console.log('Submit já em andamento...');
                return;
            }
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        }

        const titulo = document.getElementById('taskTitle')?.value?.trim();
        const descricao = document.getElementById('taskDescription')?.value?.trim();
        const prazo = document.getElementById('taskDeadline')?.value || null;
        const prioridade = document.getElementById('taskPriority')?.value || 'BAIXA';

        if (!titulo) {
            Utils.showNotification('Título é obrigatório', 'error');
            // Reativar botão se existir
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Salvar';
            }
            return;
        }

        const payload = { 
            titulo, 
            descricao, 
            prazo: prazo,
            prioridade, 
            concluida: false 
        };

        console.log('Criando tarefa:', payload);

        try {
            const res = await fetch('http://localhost:8080/tarefas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            
            const newTask = await res.json();
            console.log('Tarefa criada com sucesso:', newTask);
            
            // Fechar modal e limpar formulário
            document.getElementById('taskForm').reset();
            document.getElementById('taskModal').classList.remove('active');
            
            // Recarregar tasks apenas uma vez
            await this.loadTasks();
            
            Utils.showNotification('Tarefa criada com sucesso!', 'success');
            
        } catch (err) {
            console.error('Erro ao criar tarefa:', err);
            Utils.showNotification('Erro ao criar tarefa', 'error');
        } finally {
            // Reativar botão se existir
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Salvar';
            }
        }
    }

    openEditModal(id) {
        console.log('Editando tarefa ID:', id);
        const task = this.tasks.find(t => t.id == id);
        
        if (!task) {
            console.error('Tarefa não encontrada para ID:', id);
            Utils.showNotification('Tarefa não encontrada', 'error');
            return;
        }
        
        console.log('Tarefa encontrada:', task);
        
        document.getElementById('taskTitle').value = task.titulo || '';
        document.getElementById('taskDescription').value = task.descricao || '';
        
        // CORREÇÃO: Formato correto para input type="date"
        if (task.prazo) {
            const date = new Date(task.prazo);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('taskDeadline').value = formattedDate;
        } else {
            document.getElementById('taskDeadline').value = '';
        }
        
        document.getElementById('taskPriority').value = task.prioridade || 'BAIXA';

        const form = document.getElementById('taskForm');
        form.dataset.editingId = id;
        document.getElementById('taskModalTitle').textContent = 'Editar Tarefa';
        document.getElementById('taskModal').classList.add('active');
    }

    async updateTask(id) {
        console.log('=== DEBUG UPDATE TASK ===');
        console.log('ID:', id);
        
        const titulo = document.getElementById('taskTitle')?.value?.trim();
        const descricao = document.getElementById('taskDescription')?.value?.trim();
        const prazo = document.getElementById('taskDeadline')?.value;
        const prioridade = document.getElementById('taskPriority')?.value || 'BAIXA';

        console.log('Valores do formulário:');
        console.log(' - Título:', titulo);
        console.log(' - Descrição:', descricao);
        console.log(' - Prazo RAW:', prazo);
        console.log(' - Prazo Type:', typeof prazo);
        console.log(' - Prioridade:', prioridade);

        if (!titulo) {
            Utils.showNotification('Título é obrigatório', 'error');
            return;
        }

        const payload = { 
            titulo, 
            descricao, 
            prazo: prazo || null, // APENAS a data, sem modificações
            prioridade 
        };

        console.log('Payload FINAL enviado:', JSON.stringify(payload, null, 2));
            try {
            const res = await fetch(`http://localhost:8080/tarefas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Erro ao atualizar tarefa');
            
            document.getElementById('taskModal').classList.remove('active');
            document.getElementById('taskForm').removeAttribute('data-editing-id');
            document.getElementById('taskModalTitle').textContent = 'Nova Tarefa';
            await this.loadTasks();
            Utils.showNotification('Tarefa atualizada com sucesso!', 'success');
            
        } catch (err) {
            console.error('Erro ao atualizar tarefa:', err);
            Utils.showNotification('Erro ao atualizar tarefa', 'error');
        }
    }

    async toggleTaskCompletion(id, completed) {
        try {
            const res = await fetch(`http://localhost:8080/tarefas/${id}/concluir`, { 
                method: 'PATCH' 
            });
            
            if (!res.ok) {
                // Fallback se o endpoint PATCH não existir
                await fetch(`http://localhost:8080/tarefas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ concluida: completed })
                });
            }
            
            await this.loadTasks();
            Utils.showNotification('Status da tarefa atualizado', 'success');
            
        } catch (err) {
            console.error('Erro ao atualizar tarefa:', err);
            Utils.showNotification('Erro ao atualizar tarefa', 'error');
            await this.loadTasks(); // Recarregar para sincronizar estado
        }
    }

    async deleteTask(id) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        
        try {
            const res = await fetch(`http://localhost:8080/tarefas/${id}`, { 
                method: 'DELETE' 
            });
            
            if (!res.ok) throw new Error('Erro ao excluir tarefa');
            
            await this.loadTasks();
            Utils.showNotification('Tarefa excluída com sucesso!', 'success');
            
        } catch (err) {
            console.error('Erro ao excluir tarefa:', err);
            Utils.showNotification('Erro ao excluir tarefa', 'error');
        }
    }

    viewTask(id) {
        const task = this.tasks.find(t => t.id == id);
        if (!task) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${Utils.escapeHtml(task.titulo || 'Tarefa')}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${task.descricao ? `<p>${Utils.escapeHtml(task.descricao)}</p>` : '<p class="muted">Sem descrição</p>'}
                    <div class="task-meta" style="margin-top: 1rem;">
                        ${task.prazo ? `
                            <span class="task-deadline">
                                <i class="fas fa-calendar"></i>
                                ${Utils.formatDate(task.prazo)}
                            </span>
                        ` : ''}
                        ${task.prioridade ? `
                            <span class="task-priority priority-${task.prioridade.toLowerCase()}">
                                ${task.prioridade}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary closeView">Fechar</button>
                    <button class="btn-primary editFromView">Editar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.closeView').addEventListener('click', () => modal.remove());
        modal.querySelector('.editFromView').addEventListener('click', () => {
            modal.remove();
            this.openEditModal(id);
        });
        
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) modal.remove(); 
        });
    }

    setFilter(filter) {
        console.log('Aplicando filtro:', filter);
        
        // Atualizar estado visual das abas
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Aplicar filtro
        let filteredTasks = [];
        
        switch (filter) {
            case 'all':
                filteredTasks = this.tasks;
                break;
            case 'pending':
                filteredTasks = this.tasks.filter(task => !task.concluida);
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(task => task.concluida);
                break;
            case 'high':
                filteredTasks = this.tasks.filter(task => 
                    task.prioridade && task.prioridade.toUpperCase() === 'ALTA'
                );
                break;
            default:
                filteredTasks = this.tasks;
        }
        
        this.renderFilteredTasks(filteredTasks);
    }

        // ADICIONE este método para renderizar tarefas filtradas:
    renderFilteredTasks(filteredTasks) {
        const container = document.getElementById('tasksList');
        if (!container) return;
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h4>Nenhuma tarefa encontrada</h4>
                    <p>Nenhuma tarefa corresponde ao filtro selecionado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
        this.attachTaskListeners();
    }

}

// Inicialização global
let tarefaManager;
document.addEventListener('DOMContentLoaded', () => {
    tarefaManager = new TarefaManager();
});