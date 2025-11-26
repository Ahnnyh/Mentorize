package com.mentorize.service;

import com.mentorize.dto.MetaDTO;
import com.mentorize.exception.ResourceNotFoundException;
import com.mentorize.model.Meta;
import com.mentorize.repository.MetaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetaService {

    @Autowired
    private MetaRepository metaRepository;

    public List<MetaDTO> findAll() {
        return metaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MetaDTO findById(Long id) {
        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com id: " + id));
        return toDTO(meta);
    }

    public MetaDTO create(MetaDTO metaDTO) {
        Meta meta = toEntity(metaDTO);
        meta.setDataInicio(LocalDateTime.now());
        Meta saved = metaRepository.save(meta);
        return toDTO(saved);
    }

    public MetaDTO update(Long id, MetaDTO metaDTO) {
        return metaRepository.findById(id)
                .map(existingMeta -> {
                    updateEntityFromDTO(existingMeta, metaDTO);
                    
                    if (metaDTO.getProgresso() >= 100) {
                        existingMeta.setConcluida(true);
                    }
                    
                    Meta updated = metaRepository.save(existingMeta);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com id: " + id));
    }

    public void delete(Long id) {
        if (!metaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Meta não encontrada com id: " + id);
        }
        metaRepository.deleteById(id);
    }

    public List<MetaDTO> findByConcluidaFalse() {
        return metaRepository.findByConcluidaFalse()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MetaDTO> findByTipo(String tipo) {
        return metaRepository.findByTipo(tipo)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MetaDTO updateProgresso(Long id, int progresso) {
        return metaRepository.findById(id)
                .map(meta -> {
                    meta.setProgresso(Math.max(0, Math.min(100, progresso)));
                    if (progresso >= 100) {
                        meta.setConcluida(true);
                    }
                    Meta updated = metaRepository.save(meta);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada com id: " + id));
    }

    // Métodos de conversão
    private MetaDTO toDTO(Meta meta) {
        MetaDTO dto = new MetaDTO();
        dto.setId(meta.getId());
        dto.setNome(meta.getNome());
        dto.setDescricao(meta.getDescricao());
        dto.setProgresso(meta.getProgresso());
        dto.setTipo(meta.getTipo());
        dto.setDataInicio(meta.getDataInicio());
        dto.setDataLimite(meta.getDataLimite());
        dto.setConcluida(meta.isConcluida());
        return dto;
    }

    private Meta toEntity(MetaDTO dto) {
        Meta meta = new Meta();
        meta.setNome(dto.getNome());
        meta.setDescricao(dto.getDescricao());
        meta.setProgresso(dto.getProgresso());
        meta.setTipo(dto.getTipo());
        meta.setDataLimite(dto.getDataLimite());
        meta.setConcluida(dto.isConcluida());
        return meta;
    }

    private void updateEntityFromDTO(Meta meta, MetaDTO dto) {
        if (dto.getNome() != null) meta.setNome(dto.getNome());
        if (dto.getDescricao() != null) meta.setDescricao(dto.getDescricao());
        meta.setProgresso(dto.getProgresso());
        if (dto.getTipo() != null) meta.setTipo(dto.getTipo());
        if (dto.getDataLimite() != null) meta.setDataLimite(dto.getDataLimite());
        meta.setConcluida(dto.isConcluida());
    }
}