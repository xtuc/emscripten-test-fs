#include <emscripten.h>
#include <fstream>
#include <iostream>
#include <dirent.h>
#include <sstream>
#include <sys/types.h>
#include <string>

using namespace std;

extern "C"
const char* ls(const char* path) {
    ostringstream out;

    struct dirent *entry;
    DIR *dir = opendir(path);

    if (dir == NULL) {
        return "can not open dir";
    }
    while ((entry = readdir(dir)) != NULL) {
        out << entry->d_name << endl;
    }
    closedir(dir);

    return out.str().c_str();
}

extern "C"
const char* cat(const char* file) {
    ostringstream out;
    std::ifstream input(file);
    std::string line;

    while( getline( input, line ) ) {
        out << line << endl;
    }

    return out.str().c_str();
}

