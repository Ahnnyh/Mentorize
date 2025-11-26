// js/anotacoes.js - VERSÃO CORRIGIDA
class AnotacaoManager {
    constructor() {
        this.notes = [];
        this.editingId = null;
        this.isSaving = false;
        this.currentView = 'grid';
        this.setupEvents(); // ⭐ CORREÇÃO: chamar setupEvents diretamente
        this.loadNotes();
    }

    setupEvents() {
        console.log('Configurando event listeners para anotações...');
        
        // FORMULÁRIO
        const noteForm = document.getElementById('noteForm');
        if (noteForm && !noteForm._hasListener) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNote();
            });
            noteForm._hasListener = true;
        }

        // View options
        document.querySelectorAll('.view-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                console.log('Mudando para view:', view);
                this.setView(view);
            });
        });
    }

    openModal(note = null) {
        this.editingId = note?.id || null;

        document.getElementById("noteTitle").value = note?.titulo || "";
        document.getElementById("noteContent").value = note?.conteudo || "";

        document.getElementById("noteModal").classList.add("active");
    }

    closeModal() {
        document.getElementById("noteModal").classList.remove("active");
        this.editingId = null;
        document.getElementById("noteForm").reset();
    }

    async loadNotes() {
        try {
            const res = await fetch("http://localhost:8080/anotacoes");
            if (!res.ok) throw new Error("Erro ao carregar anotações");
            this.notes = await res.json();
            this.renderWithCurrentView();
        } catch (err) {
            console.error("Erro ao carregar anotações:", err);
            Utils.showNotification("Erro ao carregar anotações", "error");
        }
    }

    renderWithCurrentView() {
        const container = document.getElementById("notesGrid");
        if (!container) return;

        // Limpar container
        container.innerHTML = '';

        if (this.notes.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        if (this.currentView === 'list') {
            this.renderAsList();
        } else {
            this.renderAsGrid();
        }
    }

    renderAsGrid() {
        const container = document.getElementById("notesGrid");
        container.className = 'notes-grid';
        
        container.innerHTML = this.notes
            .map((note) => this.createNoteCard(note))
            .join("");

        this.attachEvents();
    }

    renderAsList() {
        const container = document.getElementById("notesGrid");
        container.className = 'notes-list';
        
        container.innerHTML = this.notes
            .map((note) => this.createNoteListItem(note))
            .join("");

        this.attachEvents();
    }

    createNoteCard(note) {
        const preview = note.conteudo ? 
            Utils.escapeHtml(note.conteudo.substring(0, 120)) + (note.conteudo.length > 120 ? '...' : '') : 
            'Sem conteúdo';
            
        return `
            <div class="note-card" data-id="${note.id}">
                <div class="note-card-header">
                    <h3 class="note-title">${Utils.escapeHtml(note.titulo)}</h3>
                </div>
                <div class="note-content">
                    <p>${preview}</p>
                </div>
                <div class="note-footer">
                    <div class="note-actions">
                        <button class="btn-icon edit-note" data-id="${note.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-note" data-id="${note.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createNoteListItem(note) {
        const preview = note.conteudo ? 
            Utils.escapeHtml(note.conteudo.substring(0, 200)) + (note.conteudo.length > 200 ? '...' : '') : 
            'Sem conteúdo';
            
        return `
            <div class="note-list-item" data-id="${note.id}">
                <div class="note-list-main">
                    <h3 class="note-title">${Utils.escapeHtml(note.titulo)}</h3>
                    <p class="note-preview">${preview}</p>
                </div>
                <div class="note-list-meta">
                    <div class="note-actions">
                        <button class="btn-icon edit-note" data-id="${note.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-note" data-id="${note.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.querySelectorAll(".edit-note").forEach((btn) => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const note = this.notes.find((n) => n.id == id);
                this.openModal(note);
            };
        });

        document.querySelectorAll(".delete-note").forEach((btn) => {
            btn.onclick = () => this.deleteNote(btn.dataset.id);
        });

        // Clique no card para visualizar
        document.querySelectorAll('.note-card, .note-list-item').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.note-actions')) return;
                const id = card.dataset.id;
                this.viewNote(id);
            });
        });
    }

    async saveNote() {
        console.log('=== SAVE NOTE STACK TRACE ===');
        console.trace();
        
        // ⭐ PREVENIR DUPLICAÇÃO
        if (this.isSaving) {
            console.log('⚠️ Save anotação já em andamento, ignorando chamada duplicada');
            return;
        }
        
        this.isSaving = true;
        console.log('=== SAVE ANOTAÇÃO (BLOQUEADO DUPLICAÇÃO) ===');
        
        try {
            const titulo = document.getElementById("noteTitle").value.trim();
            const conteudo = document.getElementById("noteContent").value.trim();

            if (!titulo) {
                Utils.showNotification("Título é obrigatório", "error");
                return;
            }

            const data = { titulo, conteudo };

            console.log('Enviando anotação:', data);

            const method = this.editingId ? "PUT" : "POST";
            const url = this.editingId
                ? `http://localhost:8080/anotacoes/${this.editingId}`
                : "http://localhost:8080/anotacoes";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Erro ao salvar anotação");

            this.closeModal();
            await this.loadNotes();
            Utils.showNotification(
                this.editingId ? "Anotação atualizada com sucesso!" : "Anotação criada com sucesso!", 
                "success"
            );

        } catch (err) {
            console.error("Erro ao salvar anotação:", err);
            Utils.showNotification("Erro ao salvar anotação", "error");
        } finally {
            // ⭐ SEMPRE liberar a flag
            this.isSaving = false;
        }
    }

    async deleteNote(id) {
        if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
        
        try {
            const res = await fetch(`http://localhost:8080/anotacoes/${id}`, { 
                method: "DELETE" 
            });
            
            if (!res.ok) throw new Error("Erro ao excluir anotação");
            
            await this.loadNotes();
            Utils.showNotification("Anotação excluída com sucesso!", "success");
            
        } catch (err) {
            console.error("Erro ao excluir anotação:", err);
            Utils.showNotification("Erro ao excluir anotação", "error");
        }
    }

    viewNote(id) {
        const note = this.notes.find(n => n.id == id);
        if (!note) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>${Utils.escapeHtml(note.titulo)}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="note-view-content">
                        ${note.conteudo ? `<p>${Utils.escapeHtml(note.conteudo)}</p>` : '<p class="muted">Sem conteúdo</p>'}
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
            this.openModal(note);
        });
        
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) modal.remove(); 
        });
    }

    setView(viewType) {
        console.log('Mudando para view:', viewType);
        this.currentView = viewType;
        
        // Atualizar botões de view
        document.querySelectorAll('.view-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.view === viewType) {
                option.classList.add('active');
            }
        });
        
        this.renderWithCurrentView();
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h4>Nenhuma anotação</h4>
                <p>Comece criando sua primeira anotação!</p>
                <button class="btn-primary" id="addNoteBtn">
                    <i class="fas fa-plus"></i>
                    Nova Anotação
                </button>
            </div>
        `;
    }
}

// Inicialização global
let anotacaoManager;
document.addEventListener('DOMContentLoaded', () => {
    anotacaoManager = new AnotacaoManager();
});