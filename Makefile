CXX := c++
CXXFLAGS := -O2 -Wall -Wextra -std=c++17
TARGET := cow-stream

all: $(TARGET)

$(TARGET): cow-stream.cpp
	$(CXX) $(CXXFLAGS) $< -o $@

run: $(TARGET)
	./$(TARGET) cow.cow

clean:
	rm -f $(TARGET)

re: clean all

.PHONY: all run clean re
