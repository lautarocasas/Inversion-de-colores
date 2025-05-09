#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>

#define MAX_THREADS 8

typedef struct {
    unsigned char* data;
    size_t start;
    size_t end;
} ThreadArgs;

void* invert_range(void* arg) {
    ThreadArgs* args = (ThreadArgs*) arg;
    for (size_t i = args->start; i < args->end; i++) {
        args->data[i] = 255 - args->data[i];
    } 
    return NULL;
}

void skip_comments(FILE* fp) {
    int ch;
    if((ch = fgetc(fp)) == '#') {
        printf("%c", ch);
        while ((ch = fgetc(fp)) != '\n') {
            printf("%c", ch);
        }
    }
    
    while ((ch = fgetc(fp)) == '#') {
        printf("%c", ch);
        while (fgetc(fp) != '\n') {
            printf("%c", ch);
        }
    }
    ungetc(ch, fp);
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Uso: %s <entrada.pgm> <salida.pgm>\n", argv[0]);
        return 1;
    }

    FILE* input = fopen(argv[1], "rb");
    if (!input) {
        perror("Error al abrir el archivo de entrada");
        return 1;
    }

    char magic[3];
    fscanf(input, "%2s", magic);
    if (strcmp(magic, "P2") != 0 && strcmp(magic, "P5") != 0) {
        fprintf(stderr, "Formato no soportado (solo P2 y P5)\n");
        fclose(input);
        return 1;
    }
    printf("Formato del archivo: %2s\n", magic);

    skip_comments(input);

    int width, height, maxval;
    fscanf(input, "%d %d", &width, &height);
    printf("Width: %d - Height: %d\n", width, height);
    
    skip_comments(input);
    
    fscanf(input, "%d", &maxval);
    printf("Valor máximo: %d\n", maxval);
    fgetc(input); // consumir el espacio o salto de línea

    size_t size = width * height;
    unsigned char* data = malloc(size);
    if (!data) {
        perror("Error al asignar memoria");
        fclose(input);
        return 1;
    }

    if (strcmp(magic, "P5") == 0) {
        // Lectura binaria
        fread(data, 1, size, input);
    } else {
        // Lectura ASCII (P2)
        for (size_t i = 0; i < size; i++) {
            int pixel;
            fscanf(input, "%d", &pixel);
            data[i] = (unsigned char) pixel;
        }
    }

    fclose(input);

    // Multihilo para invertir
    pthread_t threads[MAX_THREADS];
    ThreadArgs args[MAX_THREADS];

    size_t chunk = size / MAX_THREADS;
    for (int i = 0; i < MAX_THREADS; i++) {
        args[i].data = data;
        args[i].start = i * chunk;
        args[i].end = (i == MAX_THREADS - 1) ? size : (i + 1) * chunk;
        pthread_create(&threads[i], NULL, invert_range, &args[i]);
    }

    for (int i = 0; i < MAX_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // Escritura del archivo de salida
    FILE* output = fopen(argv[2], "wb");
    if (!output) {
        perror("Error al abrir archivo de salida");
        free(data);
        return 1;
    }

    if (strcmp(magic, "P5") == 0) {
        fprintf(output, "P5\n%d %d\n255\n", width, height);
        fwrite(data, 1, size, output);
    } else {
        fprintf(output, "P2\n%d %d\n255\n", width, height);
        for (size_t i = 0; i < size; i++) {
            fprintf(output, "%d%c", data[i], ((i + 1) % width == 0) ? '\n' : ' ');
        }
    }

    fclose(output);
    free(data);
    return 0;
}
