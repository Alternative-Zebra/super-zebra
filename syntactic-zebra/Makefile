exec = test.out
sources = $(wildcard src/*.c)
objects = $(sources: .c=.o)
flags = -g 


$(exec): $(objects)
	gcc $(objects) $(flags) -o $(exec)

%.o: %.c include/%.h
	gcc -c $(flags) $< -o $@

install: 
	make
	cp ./test.out /usr/local/bin/zebra

clean: 
	-rm *.out
	-rm *.o
	-rm src/*.o

uninstall: 
	-rm /usr/local/bin/zebra
	-rm /usr/local/bin/sz