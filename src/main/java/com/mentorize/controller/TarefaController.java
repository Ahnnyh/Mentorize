package com.mentorize.controller;

import com.mentorize.dto.TarefaDTO;
import com.mentorize.service.TarefaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarefas")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<TarefaDTO> tarefas = tarefaService.findAll();
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        TarefaDTO tarefa = tarefaService.findById(id);
        return ResponseEntity.ok(tarefa);
    }

    @PostMapping
    public ResponseEntity<TarefaDTO> criarTarefa(@Valid @RequestBody TarefaDTO tarefaDTO) {
        TarefaDTO novaTarefa = tarefaService.create(tarefaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaTarefa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaDTO> atualizarTarefa(@PathVariable Long id, @Valid @RequestBody TarefaDTO tarefaDTO) {
        TarefaDTO tarefaAtualizada = tarefaService.update(id, tarefaDTO);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTarefa(@PathVariable Long id) {
        tarefaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<TarefaDTO>> listarPendentes() {
        List<TarefaDTO> tarefas = tarefaService.findByConcluidaFalse();
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/prioridade/{prioridade}")
    public ResponseEntity<List<TarefaDTO>> listarPorPrioridade(@PathVariable String prioridade) {
        List<TarefaDTO> tarefas = tarefaService.findByPrioridade(prioridade);
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/com-prazo")
    public ResponseEntity<List<TarefaDTO>> listarComPrazo() {
        List<TarefaDTO> tarefas = tarefaService.findTarefasComPrazo();
        return ResponseEntity.ok(tarefas);
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<TarefaDTO> marcarComoConcluida(@PathVariable Long id) {
        TarefaDTO tarefaDTO = tarefaService.findById(id);
        tarefaDTO.setConcluida(true);
        TarefaDTO tarefaAtualizada = tarefaService.update(id, tarefaDTO);
        return ResponseEntity.ok(tarefaAtualizada);
    }
}