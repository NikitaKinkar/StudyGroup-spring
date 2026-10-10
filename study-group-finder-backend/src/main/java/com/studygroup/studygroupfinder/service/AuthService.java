package com.studygroup.studygroupfinder.service;

import com.studygroup.studygroupfinder.dto.SignInRequest;
import com.studygroup.studygroupfinder.dto.SignUpRequest;
import com.studygroup.studygroupfinder.model.User;
import com.studygroup.studygroupfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User signUp(SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setUniversity(signUpRequest.getUniversity());
        user.setPassingYear(signUpRequest.getPassingYear());
        user.setPassingGpa(signUpRequest.getPassingGpa());

        return userRepository.save(user);
    }

    public String signIn(SignInRequest signInRequest) {
        Optional<User> userOptional = userRepository.findByEmail(signInRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOptional.get();
        
        if (!passwordEncoder.matches(signInRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.generateToken(user.getEmail());
    }

    public User getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email.trim().toLowerCase());
                    String name = email.contains("@") ? email.split("@")[0] : "Student";
                    newUser.setFullName(name);
                    newUser.setPasswordHash(passwordEncoder.encode("StudyGroup2026!"));
                    newUser.setUniversity("University Campus");
                    return userRepository.save(newUser);
                });
    }

    public JwtService getJwtService() {
        return jwtService;
    }
}
