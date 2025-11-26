package com.mentorize.repository;

import com.mentorize.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaRepository extends JpaRepository<Meta, Long> {
    
    // Buscar metas não concluídas
    List<Meta> findByConcluidaFalse();
    
    // Buscar metas por tipo
    List<Meta> findByTipo(String tipo);
    
    // Buscar metas com progresso maior ou igual ao especificado
    List<Meta> findByProgressoGreaterThanEqual(int progresso);
    
    // Buscar metas atrasadas
    @Query("SELECT m FROM Meta m WHERE m.dataLimite < CURRENT_TIMESTAMP AND m.concluida = false")
    List<Meta> findMetasAtrasadas();
    
    // Contar metas concluídas
    @Query("SELECT COUNT(m) FROM Meta m WHERE m.concluida = true")
    Long countConcluidas();
    
    // Média de progresso das metas ativas
    @Query("SELECT AVG(m.progresso) FROM Meta m WHERE m.concluida = false")
    Double avgProgressoMetasAtivas();
    
    // Buscar metas que expiram em até X dias
    @Query("SELECT m FROM Meta m WHERE m.dataLimite BETWEEN CURRENT_TIMESTAMP AND :dataLimite AND m.concluida = false")
    List<Meta> findMetasExpirandoEm(@Param("dataLimite") java.time.LocalDateTime dataLimite);
    
    // Buscar metas por palavra-chave no nome ou descrição
    @Query("SELECT m FROM Meta m WHERE LOWER(m.nome) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.descricao) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Meta> findByKeyword(@Param("keyword") String keyword);
}