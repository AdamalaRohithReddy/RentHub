package com.rental.security;

import com.rental.entity.User;
import com.rental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Allows login via Email OR Phone number
        User user;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + identifier));
        } else {
            user = userRepository.findByPhoneNumber(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + identifier));
        }

        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }
}
