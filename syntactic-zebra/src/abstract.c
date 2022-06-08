#include "include/AST.h"
#include <stdlib.h>

AST_T *init_ast(int type)
{
    AST_T *ast = calloc(1, sizeof(struct AST_STRUCT));
    ast->type = type;

    /* AST VARIABLE DEF */
    ast->variable_definition_variable_name = (void *)0;
    ast->variable_definition_value = (void *)0;

    /* AST VARIABLE  */
    ast->variable_name = (void *)0;

    /* AST STRING */
    ast->string_value = (void *)0;

    /* AST FUNCTION CALL */
    ast->function_call_name = (void *)0;
    ast->function_call_arguments = (void *)0;
    ast->function_call_arguments_size = 0;

    /* AST COMPOUND */
    ast->compound_value = (void *)0;
    ast->compound_size = 0;

    return ast;
}