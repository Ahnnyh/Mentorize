// js/estudos.js
class EstudoManager {
    constructor() {
        this.studies = [];
        this.editingId = null;
        this.isSaving = false; // ⭐ NOVA FLAG para prevenir duplicação
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.load();
    }

    setupEventListeners() {
        console.log('Configurando event listeners para estudos...');
        
        // FORMULÁRIO - com proteção contra duplicação
        const studyForm = document.getElementById('studyForm');
        if (studyForm && !studyForm._hasListener) {
            studyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('✅ Study form submit capturado UMA vez');
                this.save();
            });
            studyForm._hasListener = true; // Marcar para evitar duplicação
        }
    }

    async load() {
        try {
            const res = await fetch("http://localhost:8080/estudos");
            if (!res.ok) throw new Error("Erro ao carregar estudos");
            this.studies = await res.json();
            this.render();
        } catch (err) {
            console.error("Erro ao carregar estudos:", err);
            Utils.showNotification("Erro ao carregar sessões de estudo", "error");
        }
    }

    openModal(study = null) {
        this.editingId = study?.id || null;

        document.getElementById("studyTitle").value = study?.titulo || "";
        document.getElementById("studySubject").value = study?.materia || "";
        document.getElementById("studyTopic").value = study?.descricao || "";
        
        // CORREÇÃO: Formato correto para data
        if (study?.prazo) {
            const date = new Date(study.prazo);
            document.getElementById("studyDate").value = date.toISOString().split('T')[0];
        } else {
            document.getElementById("studyDate").value = "";
        }
        
        document.getElementById("studyDuration").value = study?.duracao || 30;
        document.getElementById("studyNotes").value = study?.anotacoes || "";

        document.getElementById("studyModal").classList.add("active");
    }

    closeModal() {
        this.editingId = null;
        document.getElementById("studyModal").classList.remove("active");
        document.getElementById("studyForm").reset();
    }

    render() {
        const container = document.getElementById("studiesGrid");
        if (!container) return;

        if (this.studies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
                    <h4>Nenhuma sessão de estudo</h4>
                    <p>Comece criando sua primeira sessão de estudo!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.studies
            .map((s) => this.createStudyCard(s))
            .join("");

        this.attachEvents();
    }

    createStudyCard(study) {
        return `
            <div class="study-card ${study.concluido ? "completed" : ""}">
                <h3>${Utils.escapeHtml(study.titulo)}</h3>
                <p>${Utils.escapeHtml(study.descricao || "")}</p>

                <div class="meta">
                    <span><i class="fas fa-book"></i> ${Utils.escapeHtml(study.materia)}</span>
                    <span><i class="fas fa-clock"></i> ${study.duracao} min</span>
                </div>

                ${study.anotacoes ? `
                    <div class="study-notes">
                        <strong>Anotações:</strong>
                        <p>${Utils.escapeHtml(study.anotacoes)}</p>
                    </div>
                ` : ''}

                <div class="actions">
                    <button class="toggle" data-id="${study.id}">
                        ${study.concluido ? "Reabrir" : "Concluir"}
                    </button>
                    <button class="edit" data-id="${study.id}">Editar</button>
                    <button class="delete" data-id="${study.id}">Excluir</button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.querySelectorAll(".edit").forEach((btn) => {
            btn.onclick = () => {
                const study = this.studies.find((s) => s.id == btn.dataset.id);
                this.openModal(study);
            };
        });

        document.querySelectorAll(".delete").forEach((btn) => {
            btn.onclick = () => this.delete(btn.dataset.id);
        });

        document.querySelectorAll(".toggle").forEach((btn) => {
            btn.onclick = () => this.toggle(btn.dataset.id);
        });
    }

    async save() {
        // ⭐ PREVENIR DUPLICAÇÃO
        if (this.isSaving) {
            console.log('⚠️ Save estudo já em andamento, ignorando chamada duplicada');
            return;
        }
        
        this.isSaving = true;
        console.log('=== SAVE ESTUDO (BLOQUEADO DUPLICAÇÃO) ===');
        
        try {
            const data = {
                titulo: document.getElementById("studyTitle").value.trim(),
                materia: document.getElementById("studySubject").value.trim(),
                descricao: document.getElementById("studyTopic").value.trim(),
                prazo: document.getElementById("studyDate").value || null,
                anotacoes: document.getElementById("studyNotes").value.trim(),
                duracao: Number(document.getElementById("studyDuration").value),
                concluido: this.editingId
                    ? this.studies.find((s) => s.id == this.editingId).concluido
                    : false,
            };

            if (!data.titulo || !data.materia) {
                Utils.showNotification("Título e matéria são obrigatórios", "error");
                return;
            }

            console.log('Enviando estudo:', data);

            const url = this.editingId
                ? `http://localhost:8080/estudos/${this.editingId}`
                : "http://localhost:8080/estudos";

            const method = this.editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Detalhes do erro:', errorText);
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            this.closeModal();
            await this.load();
            Utils.showNotification(
                this.editingId ? "Estudo atualizado com sucesso!" : "Estudo criado com sucesso!", 
                "success"
            );

        } catch (err) {
            console.error("Erro ao salvar estudo:", err);
            Utils.showNotification(`Erro ao salvar estudo: ${err.message}`, "error");
        } finally {
            // ⭐ SEMPRE liberar a flag
            this.isSaving = false;
        }
    }

    async toggle(id) {
        try {
            const study = this.studies.find(s => s.id == id);
            const newStatus = !study.concluido;

            const res = await fetch(`http://localhost:8080/estudos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...study, concluido: newStatus })
            });

            if (!res.ok) throw new Error("Erro ao alterar status");

            await this.load();
            Utils.showNotification(
                newStatus ? "Estudo marcado como concluído!" : "Estudo reaberto!", 
                "success"
            );

        } catch (err) {
            console.error("Erro ao alterar status do estudo:", err);
            Utils.showNotification("Erro ao alterar status do estudo", "error");
        }
    }

    async delete(id) {
        if (!confirm("Tem certeza que deseja excluir esta sessão de estudo?")) return;

        try {
            const res = await fetch(`http://localhost:8080/estudos/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Erro ao excluir estudo");

            await this.load();
            Utils.showNotification("Sessão de estudo excluída com sucesso!", "success");

        } catch (err) {
            console.error("Erro ao excluir estudo:", err);
            Utils.showNotification("Erro ao excluir estudo", "error");
        }
    }
}

// Inicialização global
let estudoManager;
document.addEventListener('DOMContentLoaded', () => {
    estudoManager = new EstudoManager();
});