package com.mentorize.controller;

import com.mentorize.dto.EstudoDTO;
import com.mentorize.service.EstudoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estudos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EstudoController {

    @Autowired
    private EstudoService estudoService;

    @GetMapping
    public ResponseEntity<List<EstudoDTO>> listarTodos() {
        List<EstudoDTO> estudos = estudoService.findAll();
        return ResponseEntity.ok(estudos);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<EstudoDTO> buscarPorId(@PathVariable Long id) {
        EstudoDTO estudo = estudoService.findById(id);
        return ResponseEntity.ok(estudo);
    }

    @PostMapping
    public ResponseEntity<EstudoDTO> criarEstudo(@Valid @RequestBody EstudoDTO estudoDTO) {
        EstudoDTO novoEstudo = estudoService.create(estudoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoEstudo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstudoDTO> atualizarEstudo(@PathVariable Long id, @Valid @RequestBody EstudoDTO estudoDTO) {
        EstudoDTO estudoAtualizado = estudoService.update(id, estudoDTO);
        return ResponseEntity.ok(estudoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirEstudo(@PathVariable Long id) {
        estudoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<EstudoDTO>> listarPendentes() {
        List<EstudoDTO> estudos = estudoService.findByConcluidoFalse();
        return ResponseEntity.ok(estudos);
    }

    @GetMapping("/materia/{materia}")
    public ResponseEntity<List<EstudoDTO>> listarPorMateria(@PathVariable String materia) {
        List<EstudoDTO> estudos = estudoService.findByMateria(materia);
        return ResponseEntity.ok(estudos);
    }

    @GetMapping("/recentes")
    public ResponseEntity<List<EstudoDTO>> listarRecentes() {
        List<EstudoDTO> estudos = estudoService.findRecent();
        return ResponseEntity.ok(estudos);
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<EstudoDTO> marcarComoConcluido(@PathVariable Long id) {
        EstudoDTO estudoAtualizado = estudoService.marcarComoConcluido(id);
        return ResponseEntity.ok(estudoAtualizado);
    }

    @GetMapping("/estatisticas/tempo-total")
    public ResponseEntity<Long> getTempoTotalEstudo() {
        Long tempoTotal = estudoService.getTotalTempoEstudo();
        return ResponseEntity.ok(tempoTotal != null ? tempoTotal : 0L);
    }

    @GetMapping("/estatisticas/concluidos")
    public ResponseEntity<Long> contarConcluidos() {
        Long concluidos = estudoService.findAll().stream()
                .filter(EstudoDTO::isConcluido)
                .count();
        return ResponseEntity.ok(concluidos);
    }
}