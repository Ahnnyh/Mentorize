package com.mentorize.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "metas")
public class Meta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private int progresso = 0;

    @Column(length = 50)
    private String tipo; // "academica", "pessoal", "profissional"

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_limite")
    private LocalDateTime dataLimite;

    @Column(nullable = false)
    private boolean concluida = false;

    // Construtor padrão
    public Meta() {
        this.dataInicio = LocalDateTime.now();
        this.concluida = false;
        this.progresso = 0;
    }

    // Construtor com parâmetros
    public Meta(String nome, String descricao, String tipo, LocalDateTime dataLimite) {
        this();
        this.nome = nome;
        this.descricao = descricao;
        this.tipo = tipo;
        this.dataLimite = dataLimite;
    }

    // Getters e Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getNome() { 
        return nome; 
    }
    
    public void setNome(String nome) { 
        this.nome = nome; 
    }

    public String getDescricao() { 
        return descricao; 
    }
    
    public void setDescricao(String descricao) { 
        this.descricao = descricao; 
    }

    public int getProgresso() { 
        return progresso; 
    }
    
    public void setProgresso(int progresso) { 
        this.progresso = Math.max(0, Math.min(100, progresso));
        if (this.progresso >= 100) {
            this.concluida = true;
        }
    }

    public String getTipo() { 
        return tipo; 
    }
    
    public void setTipo(String tipo) { 
        this.tipo = tipo; 
    }

    public LocalDateTime getDataInicio() { 
        return dataInicio; 
    }
    
    public void setDataInicio(LocalDateTime dataInicio) { 
        this.dataInicio = dataInicio; 
    }

    public LocalDateTime getDataLimite() { 
        return dataLimite; 
    }
    
    public void setDataLimite(LocalDateTime dataLimite) { 
        this.dataLimite = dataLimite; 
    }

    public boolean isConcluida() { 
        return this.progresso >= 100 || this.concluida; 
    }
    
    public void setConcluida(boolean concluida) { 
        this.concluida = concluida;
        if (concluida && this.progresso < 100) {
            this.progresso = 100;
        }
    }

    // Método utilitário para verificar se a meta está atrasada
    public boolean isAtrasada() {
        return !this.concluida && 
               this.dataLimite != null && 
               this.dataLimite.isBefore(LocalDateTime.now());
    }

    // Método para calcular dias restantes
    public Long getDiasRestantes() {
        if (this.dataLimite == null || this.concluida) {
            return null;
        }
        
        LocalDateTime agora = LocalDateTime.now();
        if (agora.isAfter(this.dataLimite)) {
            return 0L;
        }
        
        return java.time.Duration.between(agora, this.dataLimite).toDays();
    }

    // Método para incrementar progresso
    public void incrementarProgresso(int valor) {
        this.setProgresso(this.progresso + valor);
    }

    // Método para decrementar progresso
    public void decrementarProgresso(int valor) {
        this.setProgresso(this.progresso - valor);
    }

    @Override
    public String toString() {
        return "Meta{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", progresso=" + progresso +
                ", tipo='" + tipo + '\'' +
                ", concluida=" + concluida +
                '}';
    }
}