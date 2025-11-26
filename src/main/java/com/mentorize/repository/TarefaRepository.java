package com.mentorize.repository;

import com.mentorize.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    
    // Buscar tarefas não concluídas
    List<Tarefa> findByConcluidaFalse();
    
    // Buscar tarefas por prioridade
    List<Tarefa> findByPrioridade(Tarefa.Prioridade prioridade);
    
    // Buscar tarefas por categoria
    List<Tarefa> findByCategoria(String categoria);
    
    // Buscar tarefas com prazo definido e não concluídas, ordenadas por prazo
    @Query("SELECT t FROM Tarefa t WHERE t.prazo IS NOT NULL AND t.concluida = false ORDER BY t.prazo ASC")
    List<Tarefa> findTarefasComPrazo();
    
    // Buscar tarefas pendentes por categoria
    @Query("SELECT t FROM Tarefa t WHERE t.categoria = :categoria AND t.concluida = false")
    List<Tarefa> findPendentesByCategoria(@Param("categoria") String categoria);
    
    // Contar tarefas concluídas
    @Query("SELECT COUNT(t) FROM Tarefa t WHERE t.concluida = true")
    Long countConcluidas();
    
    // Contar tarefas pendentes
    @Query("SELECT COUNT(t) FROM Tarefa t WHERE t.concluida = false")
    Long countPendentes();
    
    // Buscar tarefas atrasadas
    @Query("SELECT t FROM Tarefa t WHERE t.concluida = false AND t.prazo IS NOT NULL AND t.prazo < CURRENT_DATE")
    List<Tarefa> findTarefasAtrasadas();
    
    // Buscar tarefas por palavra-chave no título ou descrição
    @Query("SELECT t FROM Tarefa t WHERE LOWER(t.titulo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.descricao) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Tarefa> findByKeyword(@Param("keyword") String keyword);
    
    // Buscar tarefas criadas hoje
    @Query("SELECT t FROM Tarefa t WHERE DATE(t.dataCriacao) = CURDATE()")
    List<Tarefa> findTarefasDeHoje();
    
    // Buscar tarefas concluídas hoje
    @Query("SELECT t FROM Tarefa t WHERE t.concluida = true AND DATE(t.dataConclusao) = CURDATE()")
    List<Tarefa> findTarefasConcluidasHoje();
}