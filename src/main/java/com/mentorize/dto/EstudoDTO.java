package com.mentorize.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EstudoDTO {

    private Long id;

    @NotBlank(message = "Título é obrigatório")
    @Size(min = 1, max = 255, message = "Título deve ter entre 1 e 255 caracteres")
    private String titulo;

    @Size(max = 1000, message = "Descrição não pode ter mais de 1000 caracteres")
    private String descricao;

    @NotBlank(message = "Matéria é obrigatória")
    @Size(max = 100, message = "Matéria não pode ter mais de 100 caracteres")
    private String materia;

    private LocalDate prazo;

    private Boolean concluido;

    @NotNull(message = "Duração é obrigatória")
    private Integer duracao;

    @Size(max = 2000, message = "Anotações não pode ter mais de 2000 caracteres")
    private String anotacoes;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataCriacao;

    // Construtores
    public EstudoDTO() {}

    public EstudoDTO(String titulo, String descricao, String materia, Integer duracao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.materia = materia;
        this.duracao = duracao;
        this.concluido = false;
        this.dataCriacao = LocalDateTime.now();
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

    public Boolean isConcluido() { return concluido; }
    public Boolean getConcluido() { return concluido; }
    public void setConcluido(Boolean concluido) { this.concluido = concluido; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    public String getAnotacoes() { return anotacoes; }
    public void setAnotacoes(String anotacoes) { this.anotacoes = anotacoes; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
