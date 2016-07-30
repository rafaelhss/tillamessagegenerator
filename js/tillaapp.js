
var app = angular.module("tillaApp", []);

app.controller("tillaCtrl", function ($scope, $http) {

    $scope.texto = getTextoInicial();


    $scope.limpar = function () {
        $scope.texto = localStorage.getItem("texto");
    }

    $scope.frete = function (cep) {
        console.log(cep);

        if ($scope.texto.indexOf("[valor]") < 0 || $scope.texto.indexOf("[prazo]") < 0) {
            $scope.errotag = true;
        }
        else {
            $scope.errotag = false;

            localStorage.setItem("texto", $scope.texto);


            $scope.carregando = true;
            $http.post("https://cors-anywhere.herokuapp.com/http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo", getData(cep), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            }
            ).success(function (data, status) {
                $scope.carregando = false;
                var x2js = new X2JS();
                var xmlText = data;
                var jsonObj = x2js.xml_str2json(xmlText);

                $scope.prazo = jsonObj.cResultado.Servicos.cServico.PrazoEntrega;
                $scope.valor = jsonObj.cResultado.Servicos.cServico.Valor;



                $scope.texto = $scope.texto.replace("[valor]", jsonObj.cResultado.Servicos.cServico.Valor).replace("[prazo]", jsonObj.cResultado.Servicos.cServico.PrazoEntrega);




            }).error(function (data, status) {
                $scope.carregando = false;
                $scope.prazo = -1;
                $scope.valor = -1;

            })
        }
    }



});

function getData(cep) {
    return "nCdEmpresa=&sDsSenha=&nCdServico=41106&sCepOrigem=70873-060&sCepDestino=" + cep + "&nVlPeso=1&nCdFormato=1&nVlComprimento=61&nVlAltura=61&nVlLargura=61&nVlDiametro=61&sCdMaoPropria=&nVlValorDeclarado=0&sCdAvisoRecebimento=N";
}

function getTextoInicial() {
    if(localStorage.getItem("texto") === null)
        return "Oi piranha... o frete eh $[valor] e demora [prazo] dias... fui!";
    else
        return localStorage.getItem("texto");
    
    
}

