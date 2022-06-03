#ifndef PARSER_H
#define PARSER_H
#include "AST.h"
#include "lexer.h"

typedef struct parser_struct
{
    lexer_T *lexer;
    token_T *current_token;
} parser_t;

parser_t *init_parser(lexer_T *lexer);

void parser_eat(parser_t *parser, int token_type);

AST_T *parser_parse(parser_t *parser);

AST_T *parser_parse_statement(parser_t *parser);

AST_T *parser_parse_statements(parser_t *parser);

AST_T *parser_parse_expr(parser_t *parser);

AST_T *parser_parse_factor(parser_t *parser);

AST_T *parser_parse_term(parser_t *parser);

AST_T *parser_parse_function_call(parser_t *parser);

AST_T *parser_parse_variable(parser_t *parser);

AST_T *parser_parse_variable_def(parser_t *parser);

AST_T *parser_parse_string(parser_t *parser);

AST_T *parser_parse_id(parser_t *parser);

#endif