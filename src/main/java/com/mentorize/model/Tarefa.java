package com.mentorize.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "tarefas")
public class Tarefa {

    // --------------------------
    // ENUMS
    // --------------------------

    public enum Prioridade {

        @JsonProperty("BAIXA")
        BAIXA,

        @JsonProperty("MEDIA")
        MEDIA,

        @JsonProperty("MÉDIA")
        MEDIA_ACENTUADA,

        @JsonProperty("ALTA")
        ALTA
    }


    public enum Categoria {
        STUDY, WORK, PERSONAL, OTHER
    }

    // --------------------------
    // CAMPOS
    // --------------------------

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private boolean concluida = false;

    @Column
    private LocalDate prazo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Prioridade prioridade = Prioridade.BAIXA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Categoria categoria = Categoria.STUDY;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    // --------------------------
    // JPA HOOKS
    // --------------------------

        @PrePersist
        public void aoCriar() {
            this.dataCriacao = LocalDateTime.now();
            this.dataAtualizacao = LocalDateTime.now();
            if (this.prioridade == null) this.prioridade = Prioridade.BAIXA;
            if (this.categoria == null) this.categoria = Categoria.STUDY;
        }

    // --------------------------
    // CONSTRUTORES
    // --------------------------

    public Tarefa() {}

    public Tarefa(String titulo, String descricao, LocalDate prazo,
                  Prioridade prioridade, Categoria categoria) {

        this.titulo = titulo;
        this.descricao = descricao;
        this.prazo = prazo;
        this.prioridade = prioridade != null ? prioridade : Prioridade.BAIXA;
        this.categoria = categoria != null ? categoria : Categoria.STUDY;
    }

    // --------------------------
    // GETTERS E SETTERS
    // --------------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public boolean isConcluida() { return concluida; }

    public void setConcluida(boolean concluida) {
        boolean statusAnterior = this.concluida;
        this.concluida = concluida;

        if (concluida && !statusAnterior) {
            this.dataConclusao = LocalDateTime.now();
        } else if (!concluida && statusAnterior) {
            this.dataConclusao = null;
        }
    }

    public LocalDate getPrazo() { return prazo; }
    public void setPrazo(LocalDate prazo) { this.prazo = prazo; }

    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public void atualizarTimestamp() {
    this.dataAtualizacao = LocalDateTime.now();}

    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }

    // --------------------------
    // MÉTODOS UTILITÁRIOS
    // --------------------------

    public boolean isAtrasada() {
        return !concluida &&
               prazo != null &&
               LocalDate.now().isAfter(prazo);
    }

    public Long getDiasAtePrazo() {
        if (prazo == null || concluida) return null;

        long dias = ChronoUnit.DAYS.between(LocalDate.now(), prazo);
        return Math.max(dias, 0);
    }

    public void marcarComoConcluida() {
        setConcluida(true);
    }

    public void reabrir() {
        setConcluida(false);
    }

    public boolean isValid() {
        return titulo != null && !titulo.isBlank();
    }

    public int getPrioridadeNumerica() {
        return switch (prioridade) {
            case ALTA -> 3;
            case MEDIA -> 2;
            case BAIXA -> 1;
            default -> throw new IllegalArgumentException("Prioridade desconhecida: " + prioridade);
        };
    }


    @Override
    public String toString() {
        return "Tarefa{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", prioridade=" + prioridade +
                ", categoria=" + categoria +
                ", concluida=" + concluida +
                '}';
    }
}
