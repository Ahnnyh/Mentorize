package com.mentorize.repository;

import com.mentorize.model.Estudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstudoRepository extends JpaRepository<Estudo, Long> {
    
    List<Estudo> findAllByOrderByDataCriacaoDesc();
    List<Estudo> findByConcluidoFalse();
    List<Estudo> findByMateria(String materia);
    List<Estudo> findTop10ByOrderByDataCriacaoDesc();
    
    @Query("SELECT e FROM Estudo e WHERE e.concluido = true AND e.dataCriacao >= :data")
    List<Estudo> findConcluidosFromDate(@Param("data") java.time.LocalDateTime data);
    
    @Query("SELECT SUM(e.duracao) FROM Estudo e WHERE e.concluido = true")
    Long sumDuracaoByConcluidoTrue();
    
    @Query("SELECT e.materia, COUNT(e) FROM Estudo e GROUP BY e.materia")
    List<Object[]> countByMateria();
    
    @Query("SELECT COUNT(e) FROM Estudo e WHERE e.concluido = true")
    Long countConcluidos();
    
    @Query("SELECT AVG(e.duracao) FROM Estudo e WHERE e.concluido = true")
    Double avgDuracaoConcluidos();
}