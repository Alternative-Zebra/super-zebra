#ifndef AST_H
#define AST_H
#include <stdlib.h>

typedef struct AST_STRUCT
{
    enum
    {
        AST_VARIABLE_DEFINITION,
        AST_FUNCTION_CALL,
        AST_VARIABLE,
        AST_STRING,
        AST_COMPOUND
    } type;

    /* AST VARIABLE DEF */
    char *variable_definition_variable_name;
    struct AST_STRUCT *variable_definition_value;

    /* AST VARIABLE  */
    char *variable_name;

    /* AST STRING */
    char *string_value;

    /* AST FUNCTION CALL */
    char *function_call_name;
    struct AST_STRUCT **function_call_arguments;
    size_t function_call_arguments_size;

    /* AST COMPOUND */
    struct AST_STRUCT **compound_value;
    size_t compound_value_size;

} AST_T;

AST_T *init_ast(int type);

#endif