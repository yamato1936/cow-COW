CXX := c++
CXXFLAGS := -O2 -Wall -Wextra -std=c++17
TARGET := cow-stream
DELAY ?= 100

all: $(TARGET)

$(TARGET): cow-stream.cpp
	$(CXX) $(CXXFLAGS) $< -o $@

run: $(TARGET)
	./$(TARGET) cow.cow $(DELAY)

clean:
	rm -f $(TARGET)

re: clean all

.PHONY: all run clean re
