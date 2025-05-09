import java.io.*;
import java.util.Scanner;

public class InversionColores {

    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            System.err.println("Uso: java InversionColores <input.pgm> <output.pgm>");
            return;
        }

        String inputFilePath = args[0];
        String outputFilePath = args[1];

        FileInputStream inputStream = new FileInputStream(inputFilePath);
        Scanner scan = new Scanner(inputStream);

        String formatPGM = scan.nextLine().trim(); // P2 o P5
        int headerLinesToSkip = 1;

        // Saltar comentarios
        String line;
        do {
            line = scan.nextLine().trim();
            headerLinesToSkip++;
        } while (line.startsWith("#"));

        Scanner dimensionScanner = new Scanner(line);
        int picWidth = dimensionScanner.nextInt();
        int picHeight = dimensionScanner.nextInt();
        dimensionScanner.close();

        int maxValue = scan.nextInt();
        headerLinesToSkip++;

        scan.close();
        inputStream.close();

        int[][] data2D = new int[picHeight][picWidth];

        if (formatPGM.equals("P2")) {
            // Leer como texto
            inputStream = new FileInputStream(inputFilePath);
            scan = new Scanner(inputStream);

            // Saltar encabezado
            for (int i = 0; i < headerLinesToSkip; i++) {
                scan.nextLine();
            }

            for (int row = 0; row < picHeight; row++) {
                for (int col = 0; col < picWidth; col++) {
                    data2D[row][col] = scan.nextInt();
                }
            }

            scan.close();
        } else if (formatPGM.equals("P5")) {
            // Leer como binario
            inputStream = new FileInputStream(inputFilePath);
            DataInputStream dis = new DataInputStream(inputStream);

            // Saltar encabezado
            int newlinesToSkip = headerLinesToSkip;
            while (newlinesToSkip > 0) {
                char c;
                do {
                    c = (char) dis.readUnsignedByte();
                } while (c != '\n');
                newlinesToSkip--;
            }

            for (int row = 0; row < picHeight; row++) {
                for (int col = 0; col < picWidth; col++) {
                    data2D[row][col] = dis.readUnsignedByte();
                }
            }

            dis.close();
        } else {
            System.err.println("Formato PGM no soportado: " + formatPGM);
            return;
        }

        // Invertir colores
        for (int row = 0; row < picHeight; row++) {
            for (int col = 0; col < picWidth; col++) {
                data2D[row][col] = maxValue - data2D[row][col];
            }
        }

        // Guardar imagen invertida
        File outputFile = new File(outputFilePath);
        System.out.println("Guardando en: " + outputFile.getAbsolutePath());

        try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(outputFile))) {
            String header = formatPGM + "\n" + picWidth + " " + picHeight + "\n" + maxValue + "\n";
            bos.write(header.getBytes());

            if (formatPGM.equals("P2")) {
                for (int row = 0; row < picHeight; row++) {
                    for (int col = 0; col < picWidth; col++) {
                        bos.write((data2D[row][col] + " ").getBytes());
                    }
                    bos.write("\n".getBytes());
                }
            } else {
                for (int row = 0; row < picHeight; row++) {
                    for (int col = 0; col < picWidth; col++) {
                        bos.write((byte) data2D[row][col]);
                    }
                }
            }

            System.out.println("Imagen invertida guardada como: " + outputFilePath);
        } catch (IOException e) {
            System.err.println("Error al guardar la imagen: " + e.getMessage());
        }
    }
}
