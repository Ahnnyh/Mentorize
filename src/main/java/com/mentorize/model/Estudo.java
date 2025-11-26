package com.mentorize.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "estudos")
public class Estudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false, length = 100)
    private String materia;

    @Column(name = "prazo", length = 50)
    private LocalDate prazo;

    @Column(nullable = false)
    private boolean concluido = false;

    @Column(nullable = false)
    private Integer duracao = 30; // em minutos

    @Column(columnDefinition = "TEXT")
    private String anotacoes;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    // Construtor
    public Estudo() {
        this.dataCriacao = LocalDateTime.now();
        this.concluido = false;
        this.duracao = 30;
    }

    public Estudo(String titulo, String descricao, String materia, Integer duracao) {
        this();
        this.titulo = titulo;
        this.descricao = descricao;
        this.materia = materia;
        this.duracao = duracao;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getMateria() { return materia; }
    public void setMateria(String materia) { this.materia = materia; }

    public LocalDate getPrazo() { return prazo; }
    public void setPrazo(LocalDate prazo) { this.prazo = prazo; }

    public boolean isConcluido() { return concluido; }
    public void setConcluido(boolean concluido) { this.concluido = concluido; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    public String getAnotacoes() { return anotacoes; }
    public void setAnotacoes(String anotacoes) { this.anotacoes = anotacoes; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
