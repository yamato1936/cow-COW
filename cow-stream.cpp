//--------------------------------------------
// cow-stream: COW interpreter for cow-COW
// Same 12 COW instructions, but Moo input reads ONE byte
// instead of discarding the rest of the submitted line.
//--------------------------------------------
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <vector>

using mem_t = std::vector<int>;

static mem_t program;
static mem_t memory;
static mem_t::iterator mem_pos;
static mem_t::iterator prog_pos;

static int register_val = 0;
static bool has_register_val = false;

static void quit(bool error)
{
    // Restore terminal cursor even when COW exits unexpectedly.
    std::printf("\033[?25h");
    std::fflush(stdout);

    if (error)
    {
        std::printf("\nERROR!\n");
        std::exit(1);
    }

    std::printf("\nDone.\n");
    std::exit(0);
}

static bool exec_instruction(int instruction)
{
    switch (instruction)
    {
        // moo
        case 0:
        {
            if (prog_pos == program.begin())
                quit(true);

            prog_pos--;
            int level = 1;

            while (level > 0)
            {
                if (prog_pos == program.begin())
                    break;

                prog_pos--;

                if (*prog_pos == 0)
                    level++;
                else if (*prog_pos == 7)
                    level--;
            }

            if (level != 0)
                quit(true);

            return exec_instruction(*prog_pos);
        }

        // mOo
        case 1:
            if (mem_pos == memory.begin())
                quit(true);
            else
                mem_pos--;
            break;

        // moO
        case 2:
            mem_pos++;
            if (mem_pos == memory.end())
            {
                memory.push_back(0);
                mem_pos = memory.end();
                mem_pos--;
            }
            break;

        // mOO
        case 3:
            if (*mem_pos == 3)
                quit(false);
            return exec_instruction(*mem_pos);

        // Moo
        case 4:
            if (*mem_pos != 0)
            {
                std::printf("%c", *mem_pos);
                // Make every COW-rendered movement visible immediately.
                std::fflush(stdout);
            }
            else
            {
                // This is the deliberate cow-stream difference:
                // read exactly one byte and DO NOT discard the rest of the line.
                const int c = std::getchar();

                if (c == EOF)
                    quit(false);

                *mem_pos = c;
            }
            break;

        // MOo
        case 5:
            (*mem_pos)--;
            break;

        // MoO
        case 6:
            (*mem_pos)++;
            break;

        // MOO
        case 7:
            if (*mem_pos == 0)
            {
                int level = 1;
                int prev = 0;

                prog_pos++;

                if (prog_pos == program.end())
                    break;

                while (level > 0)
                {
                    prev = *prog_pos;
                    prog_pos++;

                    if (prog_pos == program.end())
                        break;

                    if (*prog_pos == 7)
                        level++;
                    else if (*prog_pos == 0)
                    {
                        level--;
                        if (prev == 7)
                            level--;
                    }
                }

                if (level != 0)
                    quit(true);
            }
            break;

        // OOO
        case 8:
            *mem_pos = 0;
            break;

        // MMM
        case 9:
            if (has_register_val)
                *mem_pos = register_val;
            else
                register_val = *mem_pos;

            has_register_val = !has_register_val;
            break;

        // OOM
        case 10:
            std::printf("%d\n", *mem_pos);
            std::fflush(stdout);
            break;

        // oom
        case 11:
        {
            char buf[100];
            int c = 0;

            while (c < static_cast<int>(sizeof(buf)) - 1)
            {
                const int ch = std::getchar();
                if (ch == EOF)
                    break;

                buf[c++] = static_cast<char>(ch);
                buf[c] = 0;

                if (buf[c - 1] == '\n')
                    break;
            }

            *mem_pos = std::atoi(buf);
            break;
        }

        default:
            quit(false);
    }

    prog_pos++;
    return true;
}

int main(int argc, char** argv)
{
    if (argc < 2)
    {
        std::printf("Usage: %s program.cow\n", argv[0]);
        return 1;
    }

    FILE* f = std::fopen(argv[1], "rb");

    if (!f)
    {
        std::printf("Cannot open source file [%s].\n", argv[1]);
        return 1;
    }

    char buf[3] = {0, 0, 0};

    while (!std::feof(f))
    {
        int found = 0;
        buf[2] = static_cast<char>(std::fgetc(f));

        if ((found = !std::strncmp("moo", buf, 3))) program.push_back(0);
        else if ((found = !std::strncmp("mOo", buf, 3))) program.push_back(1);
        else if ((found = !std::strncmp("moO", buf, 3))) program.push_back(2);
        else if ((found = !std::strncmp("mOO", buf, 3))) program.push_back(3);
        else if ((found = !std::strncmp("Moo", buf, 3))) program.push_back(4);
        else if ((found = !std::strncmp("MOo", buf, 3))) program.push_back(5);
        else if ((found = !std::strncmp("MoO", buf, 3))) program.push_back(6);
        else if ((found = !std::strncmp("MOO", buf, 3))) program.push_back(7);
        else if ((found = !std::strncmp("OOO", buf, 3))) program.push_back(8);
        else if ((found = !std::strncmp("MMM", buf, 3))) program.push_back(9);
        else if ((found = !std::strncmp("OOM", buf, 3))) program.push_back(10);
        else if ((found = !std::strncmp("oom", buf, 3))) program.push_back(11);

        if (found)
        {
            std::memset(buf, 0, sizeof(buf));
        }
        else
        {
            buf[0] = buf[1];
            buf[1] = buf[2];
            buf[2] = 0;
        }
    }

    std::fclose(f);

    if (program.empty())
    {
        std::printf("No COW instructions found.\n");
        return 1;
    }

    memory.push_back(0);
    mem_pos = memory.begin();
    prog_pos = program.begin();

    while (prog_pos != program.end())
        exec_instruction(*prog_pos);

    quit(false);
    return 0;
}
