package lms_backend.repository;

import lms_backend.entity.LiveStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

@Repository
public interface LiveStreamRepository extends JpaRepository<LiveStream, Long> {
    
    @Modifying
    @Query("UPDATE LiveStream l SET l.isLive = false WHERE l.id != :id AND l.category = :category")
    void setAllOtherStreamsNotLiveInCategory(@Param("id") Long id, @Param("category") String category);
}
