package com.glenneligio.dntx;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.DisabledIf;
import org.springframework.test.context.junit.jupiter.EnabledIf;

@SpringBootTest
@EnabledIf(expression = "#{environment['spring.profiles.active'] == 'test'}", loadContext = true)
class DntxApplicationTests {

	@Test
	void contextLoads() {
	}

}
