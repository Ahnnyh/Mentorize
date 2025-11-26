package com.mentorize.service;

import com.mentorize.dto.AnotacaoDTO;
import com.mentorize.exception.ResourceNotFoundException;
import com.mentorize.model.Anotacao;
import com.mentorize.repository.AnotacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnotacaoService {

    @Autowired
    private AnotacaoRepository anotacaoRepository;

    public List<AnotacaoDTO> findAll() {
        return anotacaoRepository.findAllByOrderByDataCriacaoDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AnotacaoDTO findById(Long id) {
        Anotacao anotacao = anotacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anotação não encontrada com id: " + id));
        return toDTO(anotacao);
    }

    public AnotacaoDTO create(AnotacaoDTO anotacaoDTO) {
        Anotacao anotacao = toEntity(anotacaoDTO);
        Anotacao saved = anotacaoRepository.save(anotacao);
        return toDTO(saved);
    }

    public AnotacaoDTO update(Long id, AnotacaoDTO anotacaoDTO) {
        return anotacaoRepository.findById(id)
                .map(existingAnotacao -> {
                    updateEntityFromDTO(existingAnotacao, anotacaoDTO);
                    Anotacao updated = anotacaoRepository.save(existingAnotacao);
                    return toDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Anotação não encontrada com id: " + id));
    }

    public void delete(Long id) {
        if (!anotacaoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Anotação não encontrada com id: " + id);
        }
        anotacaoRepository.deleteById(id);
    }

    public List<AnotacaoDTO> findByTituloContaining(String titulo) {
        return anotacaoRepository.findByTituloContainingIgnoreCase(titulo)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AnotacaoDTO> findRecent() {
        return anotacaoRepository.findTop5ByOrderByDataCriacaoDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Métodos de conversão
    private AnotacaoDTO toDTO(Anotacao anotacao) {
        AnotacaoDTO dto = new AnotacaoDTO();
        dto.setId(anotacao.getId());
        dto.setTitulo(anotacao.getTitulo());
        dto.setConteudo(anotacao.getConteudo());
        dto.setDataCriacao(anotacao.getDataCriacao());
        dto.setDataAtualizacao(anotacao.getDataAtualizacao());
        return dto;
    }

    private Anotacao toEntity(AnotacaoDTO dto) {
        Anotacao anotacao = new Anotacao();
        anotacao.setTitulo(dto.getTitulo());
        anotacao.setConteudo(dto.getConteudo());
        return anotacao;
    }

    private void updateEntityFromDTO(Anotacao anotacao, AnotacaoDTO dto) {
        if (dto.getTitulo() != null) anotacao.setTitulo(dto.getTitulo());
        if (dto.getConteudo() != null) anotacao.setConteudo(dto.getConteudo());
    }
}