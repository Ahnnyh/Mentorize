package com.mentorize.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class MetaDTO {

    private Long id;

    @NotBlank(message = "Nome da meta é obrigatório")
    @Size(min = 1, max = 255, message = "Nome deve ter entre 1 e 255 caracteres")
    private String nome;

    @Size(max = 1000, message = "Descrição não pode ter mais de 1000 caracteres")
    private String descricao;

    @Min(value = 0, message = "Progresso não pode ser menor que 0")
    @Max(value = 100, message = "Progresso não pode ser maior que 100")
    private int progresso;

    private String tipo;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataInicio;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dataLimite;

    private boolean concluida;

    // Campos derivados da entidade Meta
    private Long diasRestantes;
    private boolean atrasada;

    // Construtor padrão
    public MetaDTO() {}

    // Construtor com parâmetros
    public MetaDTO(String nome, String descricao, String tipo, LocalDateTime dataLimite) {
        this.nome = nome;
        this.descricao = descricao;
        this.tipo = tipo;
        this.dataLimite = dataLimite;
        this.progresso = 0;
        this.concluida = false;
        this.dataInicio = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public int getProgresso() { return progresso; }
    public void setProgresso(int progresso) { this.progresso = progresso; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }

    public LocalDateTime getDataLimite() { return dataLimite; }
    public void setDataLimite(LocalDateTime dataLimite) { this.dataLimite = dataLimite; }

    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }

    public Long getDiasRestantes() { return diasRestantes; }
    public void setDiasRestantes(Long diasRestantes) { this.diasRestantes = diasRestantes; }

    public boolean isAtrasada() { return atrasada; }
    public void setAtrasada(boolean atrasada) { this.atrasada = atrasada; }
}
