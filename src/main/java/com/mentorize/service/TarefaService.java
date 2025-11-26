package com.mentorize.service;

import com.mentorize.dto.TarefaDTO;
import com.mentorize.exception.ResourceNotFoundException;
import com.mentorize.model.Tarefa;
import com.mentorize.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    // ================================
    // LISTAR TODAS
    // ================================
    public List<TarefaDTO> findAll() {
        return tarefaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ================================
    // BUSCAR POR ID
    // ================================
    public TarefaDTO findById(Long id) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com id: " + id));
        return toDTO(tarefa);
    }

    // ================================
    // CRIAR
    // ================================
    public TarefaDTO create(TarefaDTO tarefaDTO) {
        Tarefa tarefa = toEntity(tarefaDTO);

        tarefa.setDataCriacao(LocalDateTime.now());

        Tarefa saved = tarefaRepository.save(tarefa);
        return toDTO(saved);
    }

    // ================================
    // ATUALIZAR
    // ================================
    public TarefaDTO update(Long id, TarefaDTO tarefaDTO) {
        return tarefaRepository.findById(id)
                .map(existingTarefa -> {

                    boolean estavaConcluida = existingTarefa.isConcluida();

                    updateEntityFromDTO(existingTarefa, tarefaDTO);

                    // Se concluiu agora
                    if (tarefaDTO.isConcluida() && !estavaConcluida) {
                        existingTarefa.setDataConclusao(LocalDateTime.now());
                    }

                    Tarefa updated = tarefaRepository.save(existingTarefa);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com id: " + id));
    }

    // ================================
    // DELETAR
    // ================================
    public void delete(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com id: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    // ================================
    // NÃO CONCLUÍDAS
    // ================================
    public List<TarefaDTO> findByConcluidaFalse() {
        return tarefaRepository.findByConcluidaFalse()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ================================
    // BUSCAR POR PRIORIDADE
    // ================================
    public List<TarefaDTO> findByPrioridade(String prioridade) {

        Tarefa.Prioridade prioridadeEnum = Tarefa.Prioridade.valueOf(prioridade.toUpperCase());

        return tarefaRepository.findByPrioridade(prioridadeEnum)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    // ================================
    // TAREFAS COM PRAZO
    // ================================
    public List<TarefaDTO> findTarefasComPrazo() {
        return tarefaRepository.findTarefasComPrazo()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ================================
    // ENTITY → DTO
    // ================================
    private TarefaDTO toDTO(Tarefa tarefa) {
        TarefaDTO dto = new TarefaDTO();

        dto.setId(tarefa.getId());
        dto.setTitulo(tarefa.getTitulo());
        dto.setDescricao(tarefa.getDescricao());
        dto.setConcluida(tarefa.isConcluida());
        dto.setPrazo(tarefa.getPrazo());

        // conversão Enum → String
        dto.setPrioridade(tarefa.getPrioridade().name());
        dto.setCategoria(tarefa.getCategoria().name());

        dto.setDataCriacao(tarefa.getDataCriacao());
        dto.setDataConclusao(tarefa.getDataConclusao());

        return dto;
    }

    // ================================
    // DTO → ENTITY
    // ================================
    private Tarefa toEntity(TarefaDTO dto) {
        Tarefa tarefa = new Tarefa();

        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setConcluida(dto.isConcluida());
        tarefa.setPrazo(dto.getPrazo());

        // String → Enum
        if (dto.getPrioridade() != null)
            tarefa.setPrioridade(Tarefa.Prioridade.valueOf(dto.getPrioridade().toUpperCase()));

        if (dto.getCategoria() != null)
            tarefa.setCategoria(Tarefa.Categoria.valueOf(dto.getCategoria().toUpperCase()));

        return tarefa;
    }

    // ================================
    // ATUALIZAR ENTITY EXISTENTE
    // ================================
    private void updateEntityFromDTO(Tarefa tarefa, TarefaDTO dto) {

        if (dto.getTitulo() != null) tarefa.setTitulo(dto.getTitulo());
        if (dto.getDescricao() != null) tarefa.setDescricao(dto.getDescricao());
        tarefa.setConcluida(dto.isConcluida());

        if (dto.getPrazo() != null) tarefa.setPrazo(dto.getPrazo());

        if (dto.getPrioridade() != null)
            tarefa.setPrioridade(Tarefa.Prioridade.valueOf(dto.getPrioridade().toUpperCase()));

        if (dto.getCategoria() != null)
            tarefa.setCategoria(Tarefa.Categoria.valueOf(dto.getCategoria().toUpperCase()));
    }
}
