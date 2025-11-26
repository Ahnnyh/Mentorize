package com.mentorize.controller;

import com.mentorize.dto.MetaDTO;
import com.mentorize.service.MetaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/metas")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MetaController {

    @Autowired
    private MetaService metaService;

    @GetMapping
    public ResponseEntity<List<MetaDTO>> listarTodas() {
        List<MetaDTO> metas = metaService.findAll();
        return ResponseEntity.ok(metas);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<MetaDTO> buscarPorId(@PathVariable Long id) {
        MetaDTO meta = metaService.findById(id);
        return ResponseEntity.ok(meta);
    }

    @PostMapping
    public ResponseEntity<MetaDTO> criarMeta(@Valid @RequestBody MetaDTO metaDTO) {
        MetaDTO novaMeta = metaService.create(metaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaMeta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetaDTO> atualizarMeta(@PathVariable Long id, @Valid @RequestBody MetaDTO metaDTO) {
        MetaDTO metaAtualizada = metaService.update(id, metaDTO);
        return ResponseEntity.ok(metaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirMeta(@PathVariable Long id) {
        metaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<MetaDTO>> listarPendentes() {
        List<MetaDTO> metas = metaService.findByConcluidaFalse();
        return ResponseEntity.ok(metas);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<MetaDTO>> listarPorTipo(@PathVariable String tipo) {
        List<MetaDTO> metas = metaService.findByTipo(tipo);
        return ResponseEntity.ok(metas);
    }

    @PatchMapping("/{id}/progresso")
    public ResponseEntity<MetaDTO> atualizarProgresso(@PathVariable Long id, @RequestParam int progresso) {
        MetaDTO metaAtualizada = metaService.updateProgresso(id, progresso);
        return ResponseEntity.ok(metaAtualizada);
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<MetaDTO> concluirMeta(@PathVariable Long id) {
        MetaDTO metaAtualizada = metaService.updateProgresso(id, 100);
        return ResponseEntity.ok(metaAtualizada);
    }
}