package com.mentorize.service;

import com.mentorize.dto.EstudoDTO;
import com.mentorize.exception.ResourceNotFoundException;
import com.mentorize.model.Estudo;
import com.mentorize.repository.EstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstudoService {

    @Autowired
    private EstudoRepository estudoRepository;

    public List<EstudoDTO> findAll() {
        return estudoRepository.findAllByOrderByDataCriacaoDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EstudoDTO findById(Long id) {
        Estudo estudo = estudoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudo não encontrado com id: " + id));
        return toDTO(estudo);
    }

    public EstudoDTO create(EstudoDTO estudoDTO) {
        Estudo estudo = toEntity(estudoDTO);
        estudo.setDataCriacao(LocalDateTime.now());
        Estudo saved = estudoRepository.save(estudo);
        return toDTO(saved);
    }

    public EstudoDTO update(Long id, EstudoDTO estudoDTO) {
        return estudoRepository.findById(id)
                .map(existingEstudo -> {
                    updateEntityFromDTO(existingEstudo, estudoDTO);
                    Estudo updated = estudoRepository.save(existingEstudo);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Estudo não encontrado com id: " + id));
    }

    public void delete(Long id) {
        if (!estudoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Estudo não encontrado com id: " + id);
        }
        estudoRepository.deleteById(id);
    }

    public List<EstudoDTO> findByConcluidoFalse() {
        return estudoRepository.findByConcluidoFalse()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EstudoDTO> findByMateria(String materia) {
        return estudoRepository.findByMateria(materia)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EstudoDTO> findRecent() {
        return estudoRepository.findTop10ByOrderByDataCriacaoDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EstudoDTO marcarComoConcluido(Long id) {
        return estudoRepository.findById(id)
                .map(estudo -> {
                    estudo.setConcluido(true);
                    Estudo updated = estudoRepository.save(estudo);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Estudo não encontrado com id: " + id));
    }

    public Long getTotalTempoEstudo() {
        return estudoRepository.sumDuracaoByConcluidoTrue();
    }

    // Métodos de conversão
    private EstudoDTO toDTO(Estudo estudo) {
        EstudoDTO dto = new EstudoDTO();
        dto.setId(estudo.getId());
        dto.setTitulo(estudo.getTitulo());
        dto.setDescricao(estudo.getDescricao());
        dto.setMateria(estudo.getMateria());
        dto.setPrazo(estudo.getPrazo());
        dto.setConcluido(estudo.isConcluido());
        dto.setDuracao(estudo.getDuracao());
        dto.setAnotacoes(estudo.getAnotacoes());
        dto.setDataCriacao(estudo.getDataCriacao());
        return dto;
    }

    private Estudo toEntity(EstudoDTO dto) {
        Estudo estudo = new Estudo();
        estudo.setTitulo(dto.getTitulo());
        estudo.setDescricao(dto.getDescricao());
        estudo.setMateria(dto.getMateria());
        estudo.setPrazo(dto.getPrazo());
        if (dto.getConcluido() != null) estudo.setConcluido(dto.getConcluido());
        estudo.setDuracao(dto.getDuracao());
        estudo.setAnotacoes(dto.getAnotacoes());
        return estudo;
    }

    private void updateEntityFromDTO(Estudo estudo, EstudoDTO dto) {
        if (dto.getTitulo() != null) estudo.setTitulo(dto.getTitulo());
        if (dto.getDescricao() != null) estudo.setDescricao(dto.getDescricao());
        if (dto.getMateria() != null) estudo.setMateria(dto.getMateria());
        if (dto.getPrazo() != null) estudo.setPrazo(dto.getPrazo());
        if (dto.getConcluido() != null) estudo.setConcluido(dto.getConcluido());
        if (dto.getDuracao() != null) estudo.setDuracao(dto.getDuracao());
        if (dto.getAnotacoes() != null) estudo.setAnotacoes(dto.getAnotacoes());
    }
}