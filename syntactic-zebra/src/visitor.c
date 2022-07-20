#include "include/visitor.h"
#include <stdio.h>
#include <string.h>

static AST_T *builtin_function_print(visitor_T *visitor, AST_T **args, int args_size)
{
    for (int i = 0; i < args_size; i++)
    {
        AST_T *visited_ast = visitor_visit(visitor, args[i]);

        switch (visited_ast->type)
        {
        case AST_STRING:
            printf("%s\n", visited_ast->string_value);
            break;
        default:
            printf("%p\n", visited_ast);
            break;
        }
    }

    return init_ast(AST_NOOP);
}

visitor_T *init_visitor()
{
    visitor_T *visitor = calloc(1, sizeof(struct VISITOR_STRUCT));
    visitor->variable_definitions = (void *)0;
    visitor->variable_definitions_size = 0;

    return visitor;
}

AST_T *visitor_visit(visitor_T *visitor, AST_T *node)
{
    switch (node->type)
    {
    case AST_VARIABLE_DEFINITION:
        // printf("visiting variable definition\n");
        return visitor_visit_variable_definition(visitor, node);
        break;
    case AST_VARIABLE:
        // printf("visiting variable\n");
        return visitor_visit_variable(visitor, node);
        break;
    case AST_FUNCTION_CALL:
        // printf("visiting function call\n");
        return visitor_visit_function_call(visitor, node);
        break;
    case AST_STRING:
        // printf("visiting string\n");
        return visitor_visit_string(visitor, node);
        break;
    case AST_COMPOUND:
        // printf("visiting compound\n");
        // printf("%zu\n", visitor->variable_definitions_size);
        return visitor_visit_compound(visitor, node);
        break;
    case AST_NOOP:
        // printf("visiting noop\n");
        return node;
        break;
    }

    printf("Uncaught statement of type `%d`\n", node->type);
    exit(1);

    return init_ast(AST_NOOP);
}

AST_T *visitor_visit_variable_definition(visitor_T *visitor, AST_T *node)
{
    if (visitor->variable_definitions == (void *)0)
    {
        // printf("if\n");
        visitor->variable_definitions = calloc(1, sizeof(struct AST_STRUCT *));
        visitor->variable_definitions[0] = node;
        visitor->variable_definitions_size += 1;
    }
    else
    {
        // printf("else\n");
        visitor->variable_definitions_size += 1;
        visitor->variable_definitions = realloc(
            visitor->variable_definitions,
            visitor->variable_definitions_size * sizeof(struct AST_STRUCT *));
        visitor->variable_definitions[visitor->variable_definitions_size - 1] = node;
    }
    // printf("%zu\n", visitor->variable_definitions_size);
    // printf("%s\n", node->variable_name);

    return node;
}

AST_T *visitor_visit_variable(visitor_T *visitor, AST_T *node)
{
    printf("%zu\n", visitor->variable_definitions_size);
    printf("%s\n", visitor->variable_definitions[0]->variable_name);
    for (int i = 0; i < visitor->variable_definitions_size; i++)
    {
        AST_T *vardef = visitor->variable_definitions[i];
        printf("%s\n", "ok");

        printf("%s\n", vardef->variable_name);
        printf("%s\n", node->variable_name);
        if (strcmp(vardef->variable_name, node->variable_name) == 0)
        {
            printf("VVV %s\n", node->variable_name);
            return visitor_visit(visitor, vardef->variable_definition_value);
        }
    }

    printf("Undefined variable `%s\n`", node->variable_name);
    return node;
}

AST_T *visitor_visit_function_call(visitor_T *visitor, AST_T *node)
{
    if (strcmp(node->function_call_name, "heehaw") == 0)
    {
        return builtin_function_print(visitor, node->function_call_arguments, node->function_call_arguments_size);
    }

    printf("Undefined method `%s`\n", node->function_call_name);
    exit(1);
}

AST_T *visitor_visit_string(visitor_T *visitor, AST_T *node)
{
    return node;
}

AST_T *visitor_visit_compound(visitor_T *visitor, AST_T *node)
{
    printf("internal visiting compound\n");
    for (int i = 0; i < node->compound_size; i++)
    {
        printf("loop\n");
        visitor_visit(visitor, node->compound_value[i]);
    }

    printf("Int visitor_visit_compound %zu\n", visitor->variable_definitions_size);
    return init_ast(AST_NOOP);
}