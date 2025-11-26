package com.mentorize.controller;

import com.mentorize.dto.AnotacaoDTO;
import com.mentorize.service.AnotacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anotacoes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnotacaoController {

    @Autowired
    private AnotacaoService anotacaoService;

    @GetMapping
    public ResponseEntity<List<AnotacaoDTO>> listarTodas() {
        List<AnotacaoDTO> anotacoes = anotacaoService.findAll();
        return ResponseEntity.ok(anotacoes);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<AnotacaoDTO> buscarPorId(@PathVariable Long id) {
        AnotacaoDTO anotacao = anotacaoService.findById(id);
        return ResponseEntity.ok(anotacao);
    }

    @PostMapping
    public ResponseEntity<AnotacaoDTO> criarAnotacao(@Valid @RequestBody AnotacaoDTO anotacaoDTO) {
        AnotacaoDTO novaAnotacao = anotacaoService.create(anotacaoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaAnotacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotacaoDTO> atualizarAnotacao(@PathVariable Long id, @Valid @RequestBody AnotacaoDTO anotacaoDTO) {
        AnotacaoDTO anotacaoAtualizada = anotacaoService.update(id, anotacaoDTO);
        return ResponseEntity.ok(anotacaoAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirAnotacao(@PathVariable Long id) {
        anotacaoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<AnotacaoDTO>> buscarPorTitulo(@RequestParam String titulo) {
        List<AnotacaoDTO> anotacoes = anotacaoService.findByTituloContaining(titulo);
        return ResponseEntity.ok(anotacoes);
    }

    @GetMapping("/recentes")
    public ResponseEntity<List<AnotacaoDTO>> listarRecentes() {
        List<AnotacaoDTO> anotacoes = anotacaoService.findRecent();
        return ResponseEntity.ok(anotacoes);
    }

    @GetMapping("/contagem")
    public ResponseEntity<Long> contarAnotacoes() {
        // Este método seria implementado no repository
        return ResponseEntity.ok(anotacaoService.findAll().stream().count());
    }
}