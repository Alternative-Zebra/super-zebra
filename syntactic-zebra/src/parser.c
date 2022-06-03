#include "include/parser.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

parser_t *init_parser(lexer_T *lexer)
{
    parser_t *parser = calloc(1, sizeof(struct parser_struct));
    parser->lexer = lexer;
    parser->current_token = lexer_get_next_token(lexer);

    return parser;
}

void parser_eat(parser_t *parser, int token_type)
{
    if (parser->current_token->type == token_type)
    {
        parser->current_token = lexer_get_next_token(parser->lexer);
    }
    else
    {
        printf("Error: Expected token type %d, got %d\n", token_type, parser->current_token->type);
        exit(1);
    }
}

AST_T *parser_parse(parser_t *parser)
{
    return parser_parse_statements(parser);
}

AST_T *parser_parse_statement(parser_t *parser)
{
    switch (parser->current_token->type)
    {
    case TOKEN_ID:
        return parser_parse_id(parser);
    }
}

AST_T *parser_parse_statements(parser_t *parser)
{
    AST_T *compound = init_ast(AST_COMPOUND);
    compound->compound_value = calloc(1, sizeof(struct AST_STRUCT *));

    AST_T *ast_statement = parser_parse_statement(parser);
    compound->compound_value[0] = ast_statement;

    while (parser->current_token->type == TOKEN_SEMI)
    {
        parser_eat(parser, TOKEN_SEMI);
        AST_T *ast_statement = parser_parse_statement(parser);
        compound->compound_value_size += 1;
        compound->compound_value = calloc(compound->compound_value_size, compound->compound_value_size * sizeof(struct AST_STRUCT *));
        compound->compound_value[compound->compound_value_size - 1] = ast_statement;
    }

    return compound;
}

AST_T *parser_parse_expr(parser_t *parser)
{
}

AST_T *parser_parse_factor(parser_t *parser)
{
}

AST_T *parser_parse_term(parser_t *parser)
{
}

AST_T *parser_parse_function_call(parser_t *parser)
{
}

AST_T *parser_parse_variable_def(parser_t *parser)
{
    parser_eat(parser, TOKEN_ID); // expecting the var

    char *variable_definition_variable_name = parser->current_token->value;
    parser_eat(parser, TOKEN_ID); // expecting the name
    parser_eat(parser, TOKEN_EQUALS);
    AST_T *variable_definition_value = parser_parse_expr(parser);

    AST_T *variable_def = init_ast(AST_VARIABLE_DEFINITION);
    variable_def->variable_name = variable_definition_variable_name;
    variable_def->variable_definition_value = variable_definition_value;

    return variable_def;
}

AST_T *parser_parse_variable(parser_t *parser)
{
    char *token_value = parser->current_token->value;
    parser_eat(parser, TOKEN_ID); // expecting the var or the function call name

    if (parser->current_token->type == TOKEN_LPAREN)
        return parser_parse_function_call(parser);

    AST_T *ast_variable = init_ast(AST_VARIABLE);
    ast_variable->variable_name = parser->current_token->value;

    return ast_variable;
}

AST_T *parser_parse_string(parser_t *parser)
{
}

AST_T *parser_parse_id(parser_t *parser)
{
    if (strcmp(parser->current_token->value, "var") == 0)
    {
        return parser_parse_variable_def(parser);
    }
    else
    {
        return parser_parse_variable(parser);
    }
}
