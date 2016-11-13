//
//  VisitorViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/12/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit


class VisitorViewController: UIViewController, UITextFieldDelegate {

    @IBOutlet weak var label: UILabel!
    
    var email_txt = ""
    var pass_txt = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func email(_ sender: UITextField) {
        email_txt = sender.text!
        label.text = email_txt
    }
    
    @IBAction func password(_ sender: UITextField) {
        pass_txt = sender.text!

    }
    
    func postAsync(sender: AnyObject) {
        
        // create the url-request
        let urlString = "https://vida.herokuapp.com/api/login"
        let request = NSMutableURLRequest(url: NSURL(string: urlString)! as URL)
        
        // set the method(HTTP-POST)
        request.httpMethod = "POST"
        // set the header(s)
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // set the request-body(JSON)
//        var params: [String: AnyObject] = [
//            "foo": "bar" as AnyObject,
//            "baz": [
//                "a": 1,
//                "b": 20,
//                "c": 300
//            ]
//        ]
        
        // prepare json data
        let params = [ "username": "bob", "password": "derp"] as [String : Any]
        print("hoe")
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: params)
        }catch _ as NSError{}
        
        // use NSURLSessionDataTask
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: {data, response, error in
            if (error == nil) {
                let result = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)!
                print(result)
            } else {
                print(error as Any)
            }
        })
        task.resume()
    }
    
    @IBAction func login_button(_ sender: UIButton) {
        postAsync(sender: sender)
    }
}
