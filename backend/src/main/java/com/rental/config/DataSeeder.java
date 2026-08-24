package com.rental.config;

import com.rental.entity.Category;
import com.rental.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = List.of(
                new Category("Power & Hand Tools", "Wrench", "Drills, circular saws, ladders, toolboxes"),
                new Category("Kitchen & Appliances", "Zap", "Pressure cookers, air fryers, blenders, juicers"),
                new Category("Outdoor & Camping", "Tent", "Tents, sleeping bags, camping stoves, portable grills"),
                new Category("Electronics & AV", "Tv", "Projectors, PA speakers, DSLR cameras, tripods"),
                new Category("Books & Learning", "BookOpen", "Novels, textbooks, competitive prep, manuals"),
                new Category("Board Games & Sports", "Gamepad2", "Catan, badminton sets, cricket kits, board games")
            );
            categoryRepository.saveAll(defaultCategories);
            System.out.println("🌱 [DataSeeder] Initialized default community categories in MySQL.");
        }
    }
}
