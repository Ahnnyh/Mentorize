package com.mentorize.repository;

import com.mentorize.model.Anotacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {
    
    List<Anotacao> findAllByOrderByDataCriacaoDesc();
    List<Anotacao> findByTituloContainingIgnoreCase(String titulo);
    List<Anotacao> findTop5ByOrderByDataCriacaoDesc();
    
    @Query("SELECT a FROM Anotacao a WHERE LOWER(a.conteudo) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Anotacao> findByConteudoContaining(@Param("termo") String termo);
    
    @Query("SELECT COUNT(a) FROM Anotacao a")
    Long countTotal();
    
    @Query("SELECT a FROM Anotacao a WHERE a.dataCriacao >= :data")
    List<Anotacao> findFromDate(@Param("data") java.time.LocalDateTime data);
}